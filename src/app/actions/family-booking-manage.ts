"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/lib/types";
import { getAvailableSlots } from "@/server/booking/availability";
import {
  assertBookingIsFuture,
  assertCanReschedule,
  assertNoticePeriod,
  getActiveCancellationRule,
  readBookingMetadata,
} from "@/server/booking/cancellation-policy";
import { cancelBookingInTransaction } from "@/server/booking/cancel-booking";
import {
  ensureClassSessionAndMeeting,
  scheduleBookingRemindersForBooking,
  resolveFamilyRecipientUserId,
} from "@/server/booking/confirm-booking-artifacts";
import { assertFamilyCanManageBooking } from "@/server/booking/family-booking-access";

export type FamilyBookingManageState = { ok: boolean; error: string | null };

const updateSchema = z.object({
  bookingId: z.string().min(1),
  teacherId: z.string().min(1),
  slotStart: z.string().min(4),
});

async function requireFamilySession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Not signed in");
  }
  if (session.user.role !== "STUDENT" && session.user.role !== "PARENT") {
    throw new Error("Not authorized");
  }
  return { userId: session.user.id, role: session.user.role as UserRole };
}

export async function familyCancelBookingAction(formData: FormData): Promise<void> {
  let session;
  try {
    session = await requireFamilySession();
  } catch {
    return;
  }

  const bookingId = String(formData.get("bookingId") ?? "");
  const reason = String(formData.get("cancellationReason") ?? "");
  if (!bookingId) return;

  const access = await assertFamilyCanManageBooking(session.userId, session.role, bookingId);
  if (!access.ok) return;

  const rule = await getActiveCancellationRule();
  const future = assertBookingIsFuture(access.booking);
  if (!future.ok) return;
  const notice = assertNoticePeriod(access.booking, rule);
  if (!notice.ok) return;

  await prisma.$transaction(async (tx) => {
    await cancelBookingInTransaction(tx, bookingId, { reason });
  });

  revalidatePath("/students/bookings");
  revalidatePath(`/students/bookings/${bookingId}/edit`);
  revalidatePath("/admin/bookings");
}

export async function familyUpdateBookingAction(
  _prev: FamilyBookingManageState | undefined,
  formData: FormData,
): Promise<FamilyBookingManageState> {
  let session;
  try {
    session = await requireFamilySession();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized" };
  }

  const parsed = updateSchema.safeParse({
    bookingId: formData.get("bookingId"),
    teacherId: formData.get("teacherId"),
    slotStart: formData.get("slotStart"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid form data" };
  }

  const access = await assertFamilyCanManageBooking(
    session.userId,
    session.role,
    parsed.data.bookingId,
  );
  if (!access.ok) {
    return { ok: false, error: access.error };
  }

  const booking = access.booking;
  if (booking.status !== "CONFIRMED" && booking.status !== "RESCHEDULED") {
    return { ok: false, error: "Only confirmed bookings can be rescheduled" };
  }

  const rule = await getActiveCancellationRule();
  const future = assertBookingIsFuture(booking);
  if (!future.ok) return { ok: false, error: future.error };
  const notice = assertNoticePeriod(booking, rule);
  if (!notice.ok) return { ok: false, error: notice.error };
  const reschedule = assertCanReschedule(booking, rule);
  if (!reschedule.ok) return { ok: false, error: reschedule.error };

  const slotStartDate = new Date(parsed.data.slotStart);
  if (Number.isNaN(slotStartDate.getTime())) {
    return { ok: false, error: "Invalid slot time" };
  }
  const durationMinutes = booking.durationMinutes;
  const slotEndDate = new Date(slotStartDate.getTime() + durationMinutes * 60_000);

  const windowStart = addDays(slotStartDate, -1);
  const windowEnd = addDays(slotStartDate, 1);
  const free = await getAvailableSlots(parsed.data.teacherId, windowStart, windowEnd);
  const stillFree = free.some(
    (s) =>
      Math.abs(s.start.getTime() - slotStartDate.getTime()) < 60_000 &&
      s.end.getTime() === slotEndDate.getTime(),
  );
  if (!stillFree) {
    return { ok: false, error: "That slot is no longer available" };
  }

  const meta = readBookingMetadata(booking.metadata);
  const rescheduleCount = (meta.rescheduleCount ?? 0) + 1;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          teacherId: parsed.data.teacherId,
          scheduledStartAt: slotStartDate,
          scheduledEndAt: slotEndDate,
          status: "CONFIRMED",
          metadata: { ...meta, rescheduleCount },
        },
      });

      const updated = await tx.booking.findUniqueOrThrow({
        where: { id: booking.id },
        include: { teacher: true, student: true },
      });

      await ensureClassSessionAndMeeting(tx, updated, {
        meetingTopic: `Class · ${updated.student.displayName}`,
      });

      const familyUserId = await resolveFamilyRecipientUserId(updated.studentId, session.userId);
      await scheduleBookingRemindersForBooking(
        tx,
        updated,
        updated.teacher.userId,
        familyUserId,
      );
    });

    revalidatePath("/students/bookings");
    revalidatePath(`/students/bookings/${booking.id}/edit`);
    revalidatePath("/admin/bookings");
    redirect("/students/bookings?updated=1");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error(e);
    return { ok: false, error: "Could not update booking" };
  }
}
