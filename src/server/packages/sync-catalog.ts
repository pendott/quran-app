import { PricingRuleType, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ADMIN_CREDIT_PACKAGE_NAME } from "@/server/credits/admin-credit-package";
import {
  PAYMENT_PACKAGE_CATALOG,
  PAYMENT_PACKAGE_NAMES,
  PER_SESSION_PRICING_RULE,
} from "@/lib/packages/catalog";

type Db = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;

async function upsertPricingRuleByName(
  db: Db,
  params: {
    name: string;
    type: PricingRuleType;
    price: number;
    sessionCount: number;
  },
) {
  const existing = await db.pricingRule.findFirst({ where: { name: params.name } });
  if (existing) {
    return db.pricingRule.update({
      where: { id: existing.id },
      data: {
        type: params.type,
        price: params.price,
        sessionCount: params.sessionCount,
        isActive: true,
      },
    });
  }
  return db.pricingRule.create({
    data: {
      name: params.name,
      type: params.type,
      currency: "MYR",
      price: params.price,
      sessionCount: params.sessionCount,
      isActive: true,
    },
  });
}

export async function syncPackageCatalog(db: Db = prisma) {
  await upsertPricingRuleByName(db, PER_SESSION_PRICING_RULE);

  for (const item of PAYMENT_PACKAGE_CATALOG) {
    const pricingRule = await upsertPricingRuleByName(db, {
      name: item.pricingRuleName,
      type: PricingRuleType.PACKAGE,
      price: item.price,
      sessionCount: item.sessionCredits,
    });

    const existing = await db.package.findFirst({ where: { name: item.name } });
    if (existing) {
      await db.package.update({
        where: { id: existing.id },
        data: {
          type: item.type,
          currency: "MYR",
          price: item.price,
          sessionCredits: item.sessionCredits,
          durationDays: item.durationDays,
          isActive: true,
          pricingRuleId: pricingRule.id,
        },
      });
      continue;
    }

    await db.package.create({
      data: {
        name: item.name,
        type: item.type,
        currency: "MYR",
        price: item.price,
        sessionCredits: item.sessionCredits,
        durationDays: item.durationDays,
        isActive: true,
        pricingRuleId: pricingRule.id,
      },
    });
  }

  await db.package.updateMany({
    where: {
      isActive: true,
      name: { notIn: [...PAYMENT_PACKAGE_NAMES, ADMIN_CREDIT_PACKAGE_NAME] },
    },
    data: { isActive: false },
  });
}
