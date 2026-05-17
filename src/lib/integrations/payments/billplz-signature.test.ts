import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildBillplzCallbackSignString, verifyBillplzCallbackSignature } from "./billplz-signature";

describe("verifyBillplzCallbackSignature", () => {
  it("accepts a valid x-signature for callback params", () => {
    const params = new URLSearchParams();
    params.set("id", "abc123");
    params.set("paid", "true");
    params.set("state", "paid");
    const key = "test-x-signature-key";
    const payload = buildBillplzCallbackSignString(params);
    const sig = createHmac("sha256", key).update(payload).digest("hex");
    expect(verifyBillplzCallbackSignature(params, sig, key)).toBe(true);
  });

  it("rejects wrong signature", () => {
    const params = new URLSearchParams({ id: "x", paid: "true" });
    expect(verifyBillplzCallbackSignature(params, "bad", "secret")).toBe(false);
  });
});
