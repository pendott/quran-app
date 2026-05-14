import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC-SHA256 hex of paymentId using shared secret (for server-to-server "mark paid" webhooks). */
export function buildPaymentWebhookSignature(paymentId: string, secret: string) {
  return createHmac("sha256", secret).update(paymentId).digest("hex");
}

export function verifyPaymentWebhookSignature(paymentId: string, signature: string | null, secret: string) {
  if (!signature || !paymentId || !secret) return false;
  const expected = buildPaymentWebhookSignature(paymentId, secret);
  try {
    const a = Buffer.from(signature.trim(), "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
