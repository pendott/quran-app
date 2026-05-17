import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createBillplzBill } from "@/lib/integrations/payments/billplz";
import { isBillplzEnabled } from "@/lib/payments/provider";

export async function attachBillplzToPendingPayment(input: {
  paymentId: string;
  title: string;
  amountMYR: number;
  payerEmail: string;
  payerName: string;
  redirectPath?: string;
}): Promise<{ ok: true; billUrl: string } | { ok: false; error: string }> {
  if (!isBillplzEnabled()) {
    return { ok: false, error: "Billplz is not enabled" };
  }

  const payment = await prisma.payment.findUnique({ where: { id: input.paymentId } });
  if (!payment || payment.status !== PaymentStatus.PENDING) {
    return { ok: false, error: "Payment not available" };
  }

  const bill = await createBillplzBill({
    title: input.title,
    amountMYR: input.amountMYR,
    email: input.payerEmail,
    name: input.payerName,
    reference1: input.paymentId,
    redirectPath: input.redirectPath,
  });

  if (!bill.ok) {
    return { ok: false, error: bill.error };
  }

  await prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      provider: "BILLPLZ",
      checkoutReference: bill.billId,
      providerReference: bill.billId,
    },
  });

  return { ok: true, billUrl: bill.billUrl };
}
