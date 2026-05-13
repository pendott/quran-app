"use server";

import { BookingStatus, PaymentStatus, SessionStatus } from "@prisma/client";
import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createZoomMeetingStub } from "@/lib/integrations/zoom/stub";
import { getAvailableSlots } from "@/server/booking/availability";
import { getFamilyStudentIds } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

const slotSchema = z.object({
  studentId: z.string().min(1),
  teacherId: z.string().min(1),
  slotStart: z.string().min(4),
});

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

export async function createFamilyBookingAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { ok: false as const, error: "Not signed in" };
  }

  const parsed = slotSchema.safeParse({
    studentId: formData.get("studentId"),
    teacherId: formData.get("teacherId"),
    slotStart: formData.get("slotStart"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid form data" };
  }

  const usePackage = formData.get("usePackage") === "on";

  const slotStartDate = new Date(parsed.data.slotStart);
  if (Number.isNaN(slotStartDate.getTime())) {
    return { ok: false as const, error: "Invalid slot time" };
  }
  const slotEndDate = new Date(slotStartDate.getTime() + 60 * 60 * 1000);

  const { studentId, teacherId } = parsed.data;
  const userId = session.user.id;
  const role = session.user.role as UserRole;

  const allowedIds = await getFamilyStudentIds(userId, role);
  if (!allowedIds.includes(studentId)) {
    return { ok: false as const, error: "Student not in your account" };
  }

  const windowStart = addDays(slotStartDate, -1);
  const windowEnd = addDays(slotStartDate, 1);
  const free = await getAvailableSlots(teacherId, windowStart, windowEnd);
  const stillFree = free.some(
    (s) => Math.abs(s.start.getTime() - slotStartDate.getTime()) < 60_000 && s.end.getTime() === slotEndDate.getTime(),
  );
  if (!stillFree) {
    return { ok: false as const, error: "That slot is no longer available" };
  }

  const pricing = await prisma.pricingRule.findFirst({
    where: { type: "PER_SESSION", isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!pricing) {
    return { ok: false as const, error: "No active per-session price configured" };
  }

  let packagePurchaseId: string | null = null;
  if (usePackage) {
    const purchases = await prisma.packagePurchase.findMany({
      where: { studentId, status: "ACTIVE" },
    });
    const pick = purchases.find((p) => (p.totalCredits ?? 0) > p.usedCredits);
    if (!pick) {
      return { ok: false as const, error: "No package credits available" };
    }
    packagePurchaseId = pick.id;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          studentId,
          teacherId,
          bookedById: userId,
          pricingRuleId: pricing.id,
          ...(packagePurchaseId ? { packagePurchaseId } : {}),
          status: BookingStatus.CONFIRMED,
          scheduledStartAt: slotStartDate,
          scheduledEndAt: slotEndDate,
          durationMinutes: 60,
          amountDue: usePackage ? 0 : pricing.price,
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

      const useZoomStub = process.env.ZOOM_USE_STUB === "1";
      const zoomStub = useZoomStub ? createZoomMeetingStub(`Class ${classSession.id}`) : null;

      await tx.meetingLink.create({
        data: {
          classSessionId: classSession.id,
          provider: zoomStub ? "ZOOM" : "MANUAL",
          joinUrl: zoomStub?.joinUrl ?? `https://meet.quran-class.local/${classSession.id}`,
          externalMeetingId: zoomStub?.meetingId ?? null,
          metadata: zoomStub ? { stub: true } : undefined,
        },
      });

      if (usePackage && packagePurchaseId) {
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
      } else {
        await tx.payment.create({
          data: {
            payerId: userId,
            studentId,
            bookingId: booking.id,
            status: PaymentStatus.PENDING,
            amount: pricing.price,
            currency: pricing.currency,
            provider: "MANUAL",
          },
        });
      }
    });

    revalidatePath("/students/bookings");
    revalidatePath("/students");
    revalidatePath("/admin/bookings");
    return { ok: true as const, error: null as string | null };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not create booking" };
  }
}
