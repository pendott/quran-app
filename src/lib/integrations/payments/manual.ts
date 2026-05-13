import type { PaymentProviderAdapter } from "@/lib/integrations/payments/types";

export const manualPaymentProvider: PaymentProviderAdapter = {
  id: "manual",
  async createCheckoutSession(input) {
    const providerReference = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    void input;
    return {
      providerReference,
      checkoutUrl: null,
    };
  },
};

export function getPaymentProvider(): PaymentProviderAdapter {
  return manualPaymentProvider;
}
