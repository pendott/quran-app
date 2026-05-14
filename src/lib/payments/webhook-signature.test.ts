import { describe, expect, it } from "vitest";
import { buildPaymentWebhookSignature, verifyPaymentWebhookSignature } from "./webhook-signature";

describe("verifyPaymentWebhookSignature", () => {
  it("accepts a valid HMAC hex signature", () => {
    const secret = "test-secret";
    const paymentId = "pay_abc123";
    const sig = buildPaymentWebhookSignature(paymentId, secret);
    expect(verifyPaymentWebhookSignature(paymentId, sig, secret)).toBe(true);
  });

  it("rejects wrong signature", () => {
    expect(verifyPaymentWebhookSignature("pay_1", "deadbeef", "secret")).toBe(false);
  });

  it("rejects missing signature", () => {
    expect(verifyPaymentWebhookSignature("pay_1", null, "secret")).toBe(false);
  });
});
