import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyPaymentWebhookSignature } from "@/lib/payments/webhook-signature";
import { completePackagePurchaseFromPendingPayment } from "@/server/payments/complete-package-purchase";

/**
 * Package purchase completion (server-to-server).
 *
 * **Billplz sandbox (trust mode)** — `application/x-www-form-urlencoded` with `paid=true` and `id=<bill_id>` when `BILLPLZ_CALLBACK_TRUST=1`.
 *
 * **Signed JSON** — `{ "paymentId": "<cuid>" }` with header `x-payment-signature` = HMAC-SHA256 hex of `paymentId` using `PAYMENT_WEBHOOK_SECRET`.
 *
 * **Form reference_1** — same as JSON but `reference_1` field carries `paymentId` (for manual tests from curl).
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw);
    const paid = params.get("paid") === "true";
    const billId = params.get("id");
    if (process.env.BILLPLZ_CALLBACK_TRUST === "1" && paid && billId) {
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [{ checkoutReference: billId }, { providerReference: billId }],
        },
      });
      if (payment?.status === "PENDING") {
        const result = await completePackagePurchaseFromPendingPayment(payment.id, payment.payerId);
        if (!result.ok) {
          return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
        }
        revalidatePath("/students/payments");
        revalidatePath("/students");
        return NextResponse.json({ ok: true, via: "billplz_callback_trust" });
      }
      return NextResponse.json({ ok: false, error: "No matching pending payment" }, { status: 404 });
    }

    const secretForm = process.env.PAYMENT_WEBHOOK_SECRET;
    if (secretForm) {
      const paymentId = params.get("reference_1");
      if (paymentId) {
        const signature = request.headers.get("x-payment-signature");
        if (!verifyPaymentWebhookSignature(paymentId, signature, secretForm)) {
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
        const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment) {
          return NextResponse.json({ error: "Unknown payment" }, { status: 404 });
        }
        const result = await completePackagePurchaseFromPendingPayment(paymentId, payment.payerId);
        if (!result.ok) {
          if (result.error === "aborted") {
            return NextResponse.json({ ok: false, reason: "aborted" }, { status: 409 });
          }
          return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
        }
        revalidatePath("/students/payments");
        revalidatePath("/students");
        return NextResponse.json({ ok: true, via: "form_reference" });
      }
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return NextResponse.json({ error: "Unhandled urlencoded callback" }, { status: 400 });
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

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return NextResponse.json({ error: "Unknown payment" }, { status: 404 });
  }

  const result = await completePackagePurchaseFromPendingPayment(paymentId, payment.payerId);
  if (!result.ok) {
    if (result.error === "aborted") {
      return NextResponse.json({ ok: false, reason: "aborted" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  revalidatePath("/students/payments");
  revalidatePath("/students");
  return NextResponse.json({ ok: true });
}
