"use server";

import { BookingStatus, PaymentStatus, SessionStatus } from "@prisma/client";
import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isBillplzEnabled } from "@/lib/payments/provider";
import { getAvailableSlots } from "@/server/booking/availability";
import { resolveMeetingLinkForClass } from "@/lib/integrations/zoom/resolve-meeting-link";
import { attachBillplzToPendingPayment } from "@/server/payments/start-billplz-checkout";
import { getFamilyStudentIds } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

const slotSchema = z.object({
  studentId: z.string().min(1),
  teacherId: z.string().min(1),
  slotStart: z.string().min(4),
});

export type CreateBookingState =
  | { ok: true; error: null; paymentId: string | null; billPlzUrl: string | null; needsPayment: boolean }
  | { ok: false; error: string; paymentId: null; billPlzUrl: null; needsPayment: false };

export async function getBookingSlotsAction(teacherId: string, weekStartIso: string) {
  const start = new Date(weekStartIso);
  if (Number.isNaN(start.getTime())) return { ok: false as const, error: "Invalid date" };
  const end = addDays(start, 7);
  const slots = await getAvailableSlots(teacherId, start, end);
  return {
    ok: true as const,
    slots: slots.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() })),
  };
}

export async function createFamilyBookingAction(
  _prev: CreateBookingState | undefined,
  formData: FormData,
): Promise<CreateBookingState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { ok: false, error: "Not signed in", paymentId: null, billPlzUrl: null, needsPayment: false };
  }

  const parsed = slotSchema.safeParse({
    studentId: formData.get("studentId"),
    teacherId: formData.get("teacherId"),
    slotStart: formData.get("slotStart"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid form data", paymentId: null, billPlzUrl: null, needsPayment: false };
  }

  const usePackage = formData.get("usePackage") === "on";

  const slotStartDate = new Date(parsed.data.slotStart);
  if (Number.isNaN(slotStartDate.getTime())) {
    return { ok: false, error: "Invalid slot time", paymentId: null, billPlzUrl: null, needsPayment: false };
  }
  const slotEndDate = new Date(slotStartDate.getTime() + 60 * 60 * 1000);

  const { studentId, teacherId } = parsed.data;
  const userId = session.user.id;
  const role = session.user.role as UserRole;

  const allowedIds = await getFamilyStudentIds(userId, role);
  if (!allowedIds.includes(studentId)) {
    return { ok: false, error: "Student not in your account", paymentId: null, billPlzUrl: null, needsPayment: false };
  }

  const windowStart = addDays(slotStartDate, -1);
  const windowEnd = addDays(slotStartDate, 1);
  const free = await getAvailableSlots(teacherId, windowStart, windowEnd);
  const stillFree = free.some(
    (s) => Math.abs(s.start.getTime() - slotStartDate.getTime()) < 60_000 && s.end.getTime() === slotEndDate.getTime(),
  );
  if (!stillFree) {
    return { ok: false, error: "That slot is no longer available", paymentId: null, billPlzUrl: null, needsPayment: false };
  }

  const pricing = await prisma.pricingRule.findFirst({
    where: { type: "PER_SESSION", isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!pricing) {
    return { ok: false, error: "No active per-session price configured", paymentId: null, billPlzUrl: null, needsPayment: false };
  }

  let packagePurchaseId: string | null = null;
  if (usePackage) {
    const purchases = await prisma.packagePurchase.findMany({
      where: { studentId, status: "ACTIVE" },
    });
    const pick = purchases.find((p) => (p.totalCredits ?? 0) > p.usedCredits);
    if (!pick) {
      return { ok: false, error: "No package credits available", paymentId: null, billPlzUrl: null, needsPayment: false };
    }
    packagePurchaseId = pick.id;
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });

  try {
    if (usePackage && packagePurchaseId) {
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            studentId,
            teacherId,
            bookedById: userId,
            pricingRuleId: pricing.id,
            packagePurchaseId,
            status: BookingStatus.CONFIRMED,
            scheduledStartAt: slotStartDate,
            scheduledEndAt: slotEndDate,
            durationMinutes: 60,
            amountDue: 0,
            currency: pricing.currency,
          },
        });

        const classSession = await tx.classSession.create({
          data: {
            bookingId: booking.id,
            studentId,
            teacherId,
            status: SessionStatus.SCHEDULED,
            scheduledStartAt: slotStartDate,
            scheduledEndAt: slotEndDate,
          },
        });

        const meetingLink = await resolveMeetingLinkForClass({
          topic: `Class · ${student?.displayName ?? "Student"}`,
          scheduledStartAt: slotStartDate,
          scheduledEndAt: slotEndDate,
          fallbackSessionKey: classSession.id,
        });

        await tx.meetingLink.create({
          data: {
            classSessionId: classSession.id,
            provider: meetingLink.provider,
            joinUrl: meetingLink.joinUrl,
            externalMeetingId: meetingLink.externalMeetingId,
            metadata: meetingLink.metadata,
          },
        });

        await tx.packagePurchase.update({
          where: { id: packagePurchaseId },
          data: { usedCredits: { increment: 1 } },
        });
        await tx.packageCreditUsage.create({
          data: {
            packagePurchaseId,
            bookingId: booking.id,
            creditsUsed: 1,
          },
        });
      });

      await scheduleBookingReminders(studentId, teacherId, slotStartDate, userId);
      revalidatePath("/students/bookings");
      revalidatePath("/students");
      revalidatePath("/admin/bookings");
      return { ok: true, error: null, paymentId: null, billPlzUrl: null, needsPayment: false };
    }

    const payment = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          studentId,
          teacherId,
          bookedById: userId,
          pricingRuleId: pricing.id,
          status: BookingStatus.PENDING_PAYMENT,
          scheduledStartAt: slotStartDate,
          scheduledEndAt: slotEndDate,
          durationMinutes: 60,
          amountDue: pricing.price,
          currency: pricing.currency,
        },
      });

      return tx.payment.create({
        data: {
          payerId: userId,
          studentId,
          bookingId: booking.id,
          status: PaymentStatus.PENDING,
          amount: pricing.price,
          currency: pricing.currency,
          provider: isBillplzEnabled() ? "BILLPLZ" : "MANUAL",
          metadata: { purpose: "session", bookingId: booking.id },
        },
      });
    });

    if (isBillplzEnabled()) {
      const bill = await attachBillplzToPendingPayment({
        paymentId: payment.id,
        title: `Class · ${student?.displayName ?? "Student"}`,
        amountMYR: Number(pricing.price),
        payerEmail: session.user.email ?? "payer@demo.local",
        payerName: session.user.name ?? session.user.email ?? "Parent",
        redirectPath: "/students/bookings?paid=1",
      });
      if (!bill.ok) {
        return { ok: false, error: bill.error, paymentId: null, billPlzUrl: null, needsPayment: false };
      }
      revalidatePath("/students/bookings");
      revalidatePath("/admin/bookings");
      return {
        ok: true,
        error: null,
        paymentId: payment.id,
        billPlzUrl: bill.billUrl,
        needsPayment: true,
      };
    }

    revalidatePath("/students/bookings");
    revalidatePath("/admin/bookings");
    return {
      ok: true,
      error: null,
      paymentId: payment.id,
      billPlzUrl: null,
      needsPayment: true,
    };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create booking", paymentId: null, billPlzUrl: null, needsPayment: false };
  }
}

async function scheduleBookingReminders(
  studentId: string,
  teacherId: string,
  slotStartDate: Date,
  userId: string,
) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { studentId, teacherId, scheduledStartAt: slotStartDate },
      orderBy: { createdAt: "desc" },
      include: { teacher: true },
    });
    if (!booking) return;
    const reminderAt = new Date(Math.max(Date.now() + 120_000, slotStartDate.getTime() - 24 * 60 * 60 * 1000));
    await prisma.reminder.createMany({
      data: [
        {
          bookingId: booking.id,
          recipientUserId: userId,
          channel: "EMAIL",
          templateKey: "booking_reminder_family",
          scheduledFor: reminderAt,
        },
        {
          bookingId: booking.id,
          recipientUserId: booking.teacher.userId,
          channel: "EMAIL",
          templateKey: "booking_reminder_teacher",
          scheduledFor: reminderAt,
        },
      ],
    });
  } catch (remErr) {
    console.error("reminder_create", remErr);
  }
}
