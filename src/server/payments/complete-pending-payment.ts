import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { completeBookingPaymentFromPendingPayment } from "@/server/payments/complete-booking-payment";
import { completePackagePurchaseFromPendingPayment } from "@/server/payments/complete-package-purchase";

type PaymentMeta = { packageId?: string; purpose?: string } | null;

/**
 * Idempotent webhook/finalize entry: package purchase or per-session booking.
 */
export async function completePendingPayment(
  paymentId: string,
  payerId?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return { ok: false, error: "Unknown payment" };
  }

  const effectivePayerId = payerId ?? payment.payerId;

  if (payment.status === PaymentStatus.PAID) {
    return { ok: true };
  }

  const meta = payment.metadata as PaymentMeta;

  if (payment.bookingId || meta?.purpose === "session") {
    return completeBookingPaymentFromPendingPayment(paymentId);
  }

  if (meta?.packageId) {
    return completePackagePurchaseFromPendingPayment(paymentId, effectivePayerId);
  }

  return { ok: false, error: "Unknown payment type" };
}
