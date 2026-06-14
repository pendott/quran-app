import { PackageType, PricingRuleType } from "@prisma/client";

export const PER_SESSION_PRICE_MYR = 45;

export const PER_SESSION_PRICING = {
  name: "Single session",
  price: PER_SESSION_PRICE_MYR,
  sessionCount: 1,
} as const;

/** Packages shown on /students/payments. */
export const PAYMENT_PACKAGE_CATALOG = [
  {
    name: "1 class",
    type: PackageType.SINGLE_SESSION,
    sessionCredits: 1,
    price: 45,
    durationDays: 30,
    pricingRuleName: "1-class package",
  },
  {
    name: "2 classes",
    type: PackageType.SESSION_BUNDLE,
    sessionCredits: 2,
    price: 90,
    durationDays: 60,
    pricingRuleName: "2-class package",
  },
  {
    name: "4 classes",
    type: PackageType.SESSION_BUNDLE,
    sessionCredits: 4,
    price: 180,
    durationDays: 90,
    pricingRuleName: "4-class package",
  },
] as const;

export const PAYMENT_PACKAGE_NAMES = PAYMENT_PACKAGE_CATALOG.map((p) => p.name);

export const PER_SESSION_PRICING_RULE = {
  name: PER_SESSION_PRICING.name,
  type: PricingRuleType.PER_SESSION,
  price: PER_SESSION_PRICING.price,
  sessionCount: PER_SESSION_PRICING.sessionCount,
} as const;
