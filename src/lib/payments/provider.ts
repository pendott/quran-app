export type PaymentProviderMode = "mock" | "billplz";

export function getPaymentProviderMode(): PaymentProviderMode {
  return process.env.PAYMENT_PROVIDER === "billplz" ? "billplz" : "mock";
}

export function isBillplzEnabled() {
  return getPaymentProviderMode() === "billplz";
}
