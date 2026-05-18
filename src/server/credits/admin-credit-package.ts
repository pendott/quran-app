import { PackageType } from "@prisma/client";
import { prisma } from "@/lib/db";

export const ADMIN_CREDIT_PACKAGE_NAME = "Admin credit grant";

/** Package row used for manual admin-issued session credits (not sold in checkout). */
export async function getOrCreateAdminCreditPackage() {
  const existing = await prisma.package.findFirst({
    where: { name: ADMIN_CREDIT_PACKAGE_NAME },
  });
  if (existing) return existing;

  return prisma.package.create({
    data: {
      name: ADMIN_CREDIT_PACKAGE_NAME,
      type: PackageType.SESSION_BUNDLE,
      description: "Session credits added manually by admin",
      currency: "MYR",
      price: 0,
      sessionCredits: 1,
      isActive: false,
    },
  });
}
