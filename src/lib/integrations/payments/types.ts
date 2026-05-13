export type CheckoutResult = {
  providerReference: string;
  /** For real gateways this would be a hosted checkout URL. */
  checkoutUrl: string | null;
};

export type PaymentProviderAdapter = {
  id: "manual" | "stripe" | "billplz";
  createCheckoutSession(input: {
    amount: string;
    currency: string;
    description: string;
    metadata: Record<string, string>;
  }): Promise<CheckoutResult>;
};
