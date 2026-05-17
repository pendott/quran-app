import { BookingStatus, PaymentStatus, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveMeetingLinkForClass } from "@/lib/integrations/zoom/resolve-meeting-link";

/**
 * After Billplz/mock payment for a per-session booking: confirm booking and create class session.
 */
export async function completeBookingPaymentFromPendingPayment(
  paymentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    return await prisma.$transaction(async (db) => {
      const payment = await db.payment.findUnique({ where: { id: paymentId } });
      if (!payment?.bookingId) {
        return { ok: false as const, error: "Not a booking payment" };
      }
      if (payment.status === PaymentStatus.PAID) {
        return { ok: true as const };
      }
      if (payment.status !== PaymentStatus.PENDING) {
        return { ok: false as const, error: "Payment already closed" };
      }

      const booking = await db.booking.findUnique({
        where: { id: payment.bookingId },
        include: { classSession: true, teacher: true },
      });
      if (!booking) {
        return { ok: false as const, error: "Booking not found" };
      }

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          providerReference: payment.checkoutReference ?? payment.providerReference ?? `paid_${payment.id}`,
        },
      });

      await db.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CONFIRMED },
      });

      if (!booking.classSession) {
        const classSession = await db.classSession.create({
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
          topic: `Quran class · ${booking.id.slice(0, 8)}`,
          scheduledStartAt: booking.scheduledStartAt,
          scheduledEndAt: booking.scheduledEndAt,
          fallbackSessionKey: classSession.id,
        });

        await db.meetingLink.create({
          data: {
            classSessionId: classSession.id,
            provider: link.provider,
            joinUrl: link.joinUrl,
            externalMeetingId: link.externalMeetingId,
            metadata: link.metadata,
          },
        });

        const reminderAt = new Date(
          Math.max(Date.now() + 120_000, booking.scheduledStartAt.getTime() - 24 * 60 * 60 * 1000),
        );
        await db.reminder.createMany({
          data: [
            {
              bookingId: booking.id,
              recipientUserId: payment.payerId,
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
      }

      return { ok: true as const };
    });
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not complete booking payment" };
  }
}
