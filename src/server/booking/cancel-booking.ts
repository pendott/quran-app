import type { Prisma } from "@prisma/client";
import { BookingStatus } from "@prisma/client";
import { getActiveCancellationRule } from "@/server/booking/cancellation-policy";
import { cancelBookingReminders } from "@/server/booking/confirm-booking-artifacts";

type Tx = Prisma.TransactionClient;

export async function releasePackageCreditForBooking(tx: Tx, bookingId: string) {
  const usage = await tx.packageCreditUsage.findUnique({ where: { bookingId } });
  if (!usage) return;

  await tx.packagePurchase.update({
    where: { id: usage.packagePurchaseId },
    data: { usedCredits: { decrement: usage.creditsUsed } },
  });
  await tx.packageCreditUsage.delete({ where: { bookingId } });
  await tx.booking.update({
    where: { id: bookingId },
    data: { packagePurchaseId: null },
  });
}

export async function cancelBookingInTransaction(
  tx: Tx,
  bookingId: string,
  options?: { reason?: string; refundPackageCredit?: boolean },
) {
  const rule = await getActiveCancellationRule();
  const refundCredit = options?.refundPackageCredit ?? rule?.packageCreditRefund ?? true;

  await tx.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: options?.reason?.trim() || null,
      cancellationRequestedAt: new Date(),
      cancelledAt: new Date(),
    },
  });

  if (refundCredit) {
    await releasePackageCreditForBooking(tx, bookingId);
  }

  await cancelBookingReminders(tx, bookingId);

  const classSession = await tx.classSession.findUnique({ where: { bookingId } });
  if (classSession) {
    await tx.classSession.update({
      where: { id: classSession.id },
      data: { status: "CANCELLED" },
    });
  }
}
