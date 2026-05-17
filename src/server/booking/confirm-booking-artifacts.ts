import type { Booking, Prisma } from "@prisma/client";
import { BookingStatus, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveMeetingLinkForClass } from "@/lib/integrations/zoom/resolve-meeting-link";

type Tx = Prisma.TransactionClient;

export async function ensureClassSessionAndMeeting(
  tx: Tx,
  booking: Pick<Booking, "id" | "studentId" | "teacherId" | "scheduledStartAt" | "scheduledEndAt">,
  options?: { meetingTopic?: string },
) {
  const existing = await tx.classSession.findUnique({
    where: { bookingId: booking.id },
    include: { meetingLink: true },
  });
  if (existing) {
    await tx.classSession.update({
      where: { id: existing.id },
      data: {
        studentId: booking.studentId,
        teacherId: booking.teacherId,
        scheduledStartAt: booking.scheduledStartAt,
        scheduledEndAt: booking.scheduledEndAt,
      },
    });
    return existing.id;
  }

  const classSession = await tx.classSession.create({
    data: {
      bookingId: booking.id,
      studentId: booking.studentId,
      teacherId: booking.teacherId,
      status: SessionStatus.SCHEDULED,
      scheduledStartAt: booking.scheduledStartAt,
      scheduledEndAt: booking.scheduledEndAt,
    },
  });

  const link = await resolveMeetingLinkForClass({
    topic: options?.meetingTopic ?? `Quran class · ${booking.id.slice(0, 8)}`,
    scheduledStartAt: booking.scheduledStartAt,
    scheduledEndAt: booking.scheduledEndAt,
    fallbackSessionKey: classSession.id,
  });

  await tx.meetingLink.create({
    data: {
      classSessionId: classSession.id,
      provider: link.provider,
      joinUrl: link.joinUrl,
      externalMeetingId: link.externalMeetingId,
      metadata: link.metadata,
    },
  });

  return classSession.id;
}

export async function scheduleBookingRemindersForBooking(
  tx: Tx,
  booking: Pick<Booking, "id" | "studentId" | "scheduledStartAt">,
  teacherUserId: string,
  familyRecipientUserId: string,
) {
  const reminderAt = new Date(
    Math.max(Date.now() + 120_000, booking.scheduledStartAt.getTime() - 24 * 60 * 60 * 1000),
  );

  await tx.reminder.updateMany({
    where: { bookingId: booking.id, status: "SCHEDULED" },
    data: { status: "CANCELLED" },
  });

  await tx.reminder.createMany({
    data: [
      {
        bookingId: booking.id,
        recipientUserId: familyRecipientUserId,
        channel: "EMAIL",
        templateKey: "booking_reminder_family",
        scheduledFor: reminderAt,
      },
      {
        bookingId: booking.id,
        recipientUserId: teacherUserId,
        channel: "EMAIL",
        templateKey: "booking_reminder_teacher",
        scheduledFor: reminderAt,
      },
    ],
  });
}

export async function resolveFamilyRecipientUserId(studentId: string, fallbackUserId: string) {
  const link = await prisma.parentStudent.findFirst({
    where: { studentId },
    include: { parent: { select: { userId: true } } },
  });
  return link?.parent.userId ?? fallbackUserId;
}

export async function applyPackageCreditToBooking(
  tx: Tx,
  bookingId: string,
  studentId: string,
): Promise<{ ok: true; packagePurchaseId: string } | { ok: false; error: string }> {
  const purchases = await tx.packagePurchase.findMany({
    where: { studentId, status: "ACTIVE" },
  });
  const pick = purchases.find((p) => (p.totalCredits ?? 0) > p.usedCredits);
  if (!pick) {
    return { ok: false, error: "No package credits available for this student" };
  }

  await tx.booking.update({
    where: { id: bookingId },
    data: {
      packagePurchaseId: pick.id,
      amountDue: 0,
    },
  });

  await tx.packagePurchase.update({
    where: { id: pick.id },
    data: { usedCredits: { increment: 1 } },
  });

  await tx.packageCreditUsage.create({
    data: {
      packagePurchaseId: pick.id,
      bookingId,
      creditsUsed: 1,
    },
  });

  return { ok: true, packagePurchaseId: pick.id };
}

export async function cancelBookingReminders(tx: Tx, bookingId: string) {
  await tx.reminder.updateMany({
    where: { bookingId, status: "SCHEDULED" },
    data: { status: "CANCELLED" },
  });
}

export function isConfirmedLikeStatus(status: BookingStatus) {
  return status === BookingStatus.CONFIRMED || status === BookingStatus.COMPLETED;
}
