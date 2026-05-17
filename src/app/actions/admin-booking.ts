"use server";

import { BookingStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { parseDatetimeLocal } from "@/lib/datetime-local";
import { prisma } from "@/lib/db";
import {
  applyPackageCreditToBooking,
  cancelBookingReminders,
  ensureClassSessionAndMeeting,
  isConfirmedLikeStatus,
  resolveFamilyRecipientUserId,
  scheduleBookingRemindersForBooking,
} from "@/server/booking/confirm-booking-artifacts";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

const createSchema = z.object({
  studentId: z.string().min(1),
  teacherId: z.string().min(1),
  scheduledStartAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  status: z.enum(["CONFIRMED", "PENDING_PAYMENT"]),
  usePackage: z.boolean(),
});

const updateSchema = z.object({
  bookingId: z.string().min(1),
  studentId: z.string().min(1),
  teacherId: z.string().min(1),
  scheduledStartAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  status: z.nativeEnum(BookingStatus),
  cancellationReason: z.string().optional(),
});

export type AdminBookingFormState = { ok: boolean; error: string | null };

export async function adminCreateBookingAction(
  _prev: AdminBookingFormState | undefined,
  formData: FormData,
): Promise<AdminBookingFormState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = createSchema.safeParse({
    studentId: formData.get("studentId"),
    teacherId: formData.get("teacherId"),
    scheduledStartAt: formData.get("scheduledStartAt"),
    durationMinutes: formData.get("durationMinutes") ?? "60",
    status: formData.get("status"),
    usePackage: formData.get("usePackage") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid form data" };
  }

  const start = parseDatetimeLocal(parsed.data.scheduledStartAt);
  if (!start) {
    return { ok: false, error: "Invalid start time" };
  }
  const end = new Date(start.getTime() + parsed.data.durationMinutes * 60_000);

  const [student, teacher, pricing] = await Promise.all([
    prisma.student.findUnique({ where: { id: parsed.data.studentId } }),
    prisma.teacher.findUnique({ where: { id: parsed.data.teacherId }, include: { user: true } }),
    prisma.pricingRule.findFirst({ where: { type: "PER_SESSION", isActive: true }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!student) return { ok: false, error: "Student not found" };
  if (!teacher) return { ok: false, error: "Teacher not found" };
  if (!pricing) return { ok: false, error: "No active per-session price configured" };

  const status = parsed.data.status as BookingStatus;
  const usePackage = parsed.data.usePackage && status === BookingStatus.CONFIRMED;

  try {
    const bookingId = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          studentId: parsed.data.studentId,
          teacherId: parsed.data.teacherId,
          bookedById: session.user.id,
          pricingRuleId: pricing.id,
          status,
          scheduledStartAt: start,
          scheduledEndAt: end,
          durationMinutes: parsed.data.durationMinutes,
          amountDue: status === BookingStatus.CONFIRMED ? 0 : pricing.price,
          currency: pricing.currency,
        },
      });

      if (usePackage) {
        const credit = await applyPackageCreditToBooking(tx, booking.id, parsed.data.studentId);
        if (!credit.ok) {
          throw new Error(credit.error);
        }
      }

      if (status === BookingStatus.PENDING_PAYMENT) {
        await tx.payment.create({
          data: {
            payerId: session.user.id,
            studentId: parsed.data.studentId,
            bookingId: booking.id,
            status: PaymentStatus.PENDING,
            amount: pricing.price,
            currency: pricing.currency,
            provider: "MANUAL",
            metadata: { purpose: "session", bookingId: booking.id, createdByAdmin: true },
          },
        });
      }

      if (status === BookingStatus.CONFIRMED) {
        await ensureClassSessionAndMeeting(tx, booking);
        const familyUserId = await resolveFamilyRecipientUserId(parsed.data.studentId, session.user.id);
        await scheduleBookingRemindersForBooking(tx, booking, teacher.userId, familyUserId);
      }

      return booking.id;
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/students/bookings");
    redirect(`/admin/bookings/${bookingId}/edit?created=1`);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    const message = e instanceof Error ? e.message : "Could not create booking";
    console.error(e);
    return { ok: false, error: message };
  }
}

export async function adminUpdateBookingAction(
  _prev: AdminBookingFormState | undefined,
  formData: FormData,
): Promise<AdminBookingFormState> {
  let adminSession;
  try {
    adminSession = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = updateSchema.safeParse({
    bookingId: formData.get("bookingId"),
    studentId: formData.get("studentId"),
    teacherId: formData.get("teacherId"),
    scheduledStartAt: formData.get("scheduledStartAt"),
    durationMinutes: formData.get("durationMinutes") ?? "60",
    status: formData.get("status"),
    cancellationReason: formData.get("cancellationReason") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid form data" };
  }

  const start = parseDatetimeLocal(parsed.data.scheduledStartAt);
  if (!start) {
    return { ok: false, error: "Invalid start time" };
  }
  const end = new Date(start.getTime() + parsed.data.durationMinutes * 60_000);

  const existing = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { teacher: true, creditUsage: true },
  });
  if (!existing) {
    return { ok: false, error: "Booking not found" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const wasConfirmed = isConfirmedLikeStatus(existing.status);
      const willBeConfirmed = isConfirmedLikeStatus(parsed.data.status);
      const willBeCancelled = parsed.data.status === BookingStatus.CANCELLED;

      await tx.booking.update({
        where: { id: parsed.data.bookingId },
        data: {
          studentId: parsed.data.studentId,
          teacherId: parsed.data.teacherId,
          scheduledStartAt: start,
          scheduledEndAt: end,
          durationMinutes: parsed.data.durationMinutes,
          status: parsed.data.status,
          cancellationReason: willBeCancelled ? parsed.data.cancellationReason ?? existing.cancellationReason : null,
          cancelledAt: willBeCancelled ? existing.cancelledAt ?? new Date() : null,
        },
      });

      const updated = await tx.booking.findUniqueOrThrow({
        where: { id: parsed.data.bookingId },
        include: { teacher: true },
      });

      if (willBeCancelled) {
        await cancelBookingReminders(tx, parsed.data.bookingId);
        const classSession = await tx.classSession.findUnique({ where: { bookingId: parsed.data.bookingId } });
        if (classSession) {
          await tx.classSession.update({
            where: { id: classSession.id },
            data: { status: "CANCELLED" },
          });
        }
        return;
      }

      if (willBeConfirmed) {
        await ensureClassSessionAndMeeting(tx, updated);
        const familyUserId = await resolveFamilyRecipientUserId(
          parsed.data.studentId,
          adminSession.user.id ?? existing.bookedById,
        );
        await scheduleBookingRemindersForBooking(tx, updated, updated.teacher.userId, familyUserId);
      } else if (wasConfirmed && !willBeConfirmed) {
        await cancelBookingReminders(tx, parsed.data.bookingId);
      }
    });

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${parsed.data.bookingId}/edit`);
    revalidatePath("/students/bookings");
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update booking" };
  }
}
