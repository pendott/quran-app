import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyBillplzCallbackSignature } from "@/lib/integrations/payments/billplz-signature";
import { verifyPaymentWebhookSignature } from "@/lib/payments/webhook-signature";
import { completePendingPayment } from "@/server/payments/complete-pending-payment";

/**
 * Payment completion webhook.
 *
 * **Billplz** — `application/x-www-form-urlencoded` with `x-signature` (set `BILLPLZ_X_SIGNATURE`).
 *
 * **Signed JSON** — `{ "paymentId": "<cuid>" }` + header `x-payment-signature` (HMAC with `PAYMENT_WEBHOOK_SECRET`).
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    const xSignatureKey = process.env.BILLPLZ_X_SIGNATURE ?? process.env.PAYMENT_WEBHOOK_SECRET;

    if (xSignatureKey) {
      const headerSig = request.headers.get("x-signature");
      if (!verifyBillplzCallbackSignature(params, headerSig, xSignatureKey)) {
        return NextResponse.json({ error: "Invalid Billplz signature" }, { status: 401 });
      }
    }

    const paid = params.get("paid") === "true";
    const billId = params.get("id");
    const paymentId = params.get("reference_1");

    if (!paid) {
      if (paymentId) {
        await prisma.payment.updateMany({
          where: { id: paymentId, status: "PENDING" },
          data: { status: "FAILED" },
        });
      }
      return NextResponse.json({ ok: false, reason: "not_paid" });
    }

    const payment = paymentId
      ? await prisma.payment.findUnique({ where: { id: paymentId } })
      : billId
        ? await prisma.payment.findFirst({
            where: {
              OR: [{ checkoutReference: billId }, { providerReference: billId }],
            },
          })
        : null;

    if (!payment) {
      return NextResponse.json({ error: "No matching pending payment" }, { status: 404 });
    }

    const result = await completePendingPayment(payment.id);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    revalidatePath("/students/payments");
    revalidatePath("/students/bookings");
    revalidatePath("/students");
    return NextResponse.json({ ok: true, via: "billplz" });
  }

  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "PAYMENT_WEBHOOK_SECRET is not configured" }, { status: 503 });
  }

  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  }

  let paymentId: string | null = null;
  try {
    const body = JSON.parse(raw) as { paymentId?: string };
    paymentId = typeof body?.paymentId === "string" ? body.paymentId : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  const signature = request.headers.get("x-payment-signature");
  if (!verifyPaymentWebhookSignature(paymentId, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const result = await completePendingPayment(paymentId);
  if (!result.ok) {
    if (result.error === "aborted") {
      return NextResponse.json({ ok: false, reason: "aborted" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  revalidatePath("/students/payments");
  revalidatePath("/students/bookings");
  revalidatePath("/students");
  return NextResponse.json({ ok: true });
}
