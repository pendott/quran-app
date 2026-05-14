import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

type PaymentMeta = { packageId?: string } | null;

/**
 * Idempotent: creates PackagePurchase and marks Payment PAID for a pending package checkout.
 * Used by mock FPX finalize and by payment webhooks.
 */
export async function completePackagePurchaseFromPendingPayment(
  paymentId: string,
  payerId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    return await prisma.$transaction(async (db) => {
      const payment = await db.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.payerId !== payerId) {
        return { ok: false as const, error: "Invalid payment" };
      }
      if (payment.status === PaymentStatus.FAILED) {
        return { ok: false as const, error: "aborted" };
      }
      if (payment.status === PaymentStatus.PAID && payment.packagePurchaseId) {
        return { ok: true as const };
      }
      if (payment.status !== PaymentStatus.PENDING) {
        return { ok: false as const, error: "Payment already closed" };
      }

      const meta = payment.metadata as PaymentMeta;
      const packageId = meta?.packageId;
      if (!packageId) {
        return { ok: false as const, error: "Missing package on payment" };
      }

      const pkg = await db.package.findFirst({ where: { id: packageId, isActive: true } });
      if (!pkg) {
        return { ok: false as const, error: "Package unavailable" };
      }

      const purchase = await db.packagePurchase.create({
        data: {
          packageId: pkg.id,
          studentId: payment.studentId,
          purchasedById: payment.payerId,
          status: "ACTIVE",
          totalCredits: pkg.sessionCredits ?? 0,
          usedCredits: 0,
        },
      });

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          packagePurchaseId: purchase.id,
          paidAt: new Date(),
          providerReference: payment.checkoutReference ?? `paid_${payment.id}`,
        },
      });

      return { ok: true as const };
    });
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not complete purchase" };
  }
}
