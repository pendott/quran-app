import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Billplz callback x-signature (v3/v4).
 * @see https://www.billplz.com/api#payment-order-callback
 */
export function buildBillplzCallbackSignString(params: URLSearchParams) {
  const keys = [...params.keys()]
    .filter((k) => k !== "x_signature")
    .sort();
  return keys.map((k) => `billplz${k}${params.get(k) ?? ""}`).join("|");
}

export function verifyBillplzCallbackSignature(
  params: URLSearchParams,
  signatureHeader: string | null,
  xSignatureKey: string,
) {
  if (!signatureHeader || !xSignatureKey) return false;
  const payload = buildBillplzCallbackSignString(params);
  const expected = createHmac("sha256", xSignatureKey).update(payload).digest("hex");
  try {
    const a = Buffer.from(signatureHeader.trim(), "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
