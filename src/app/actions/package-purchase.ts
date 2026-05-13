"use server";

import { prisma } from "@/lib/db";

export async function listActivePackagesForCatalog() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    take: 10,
  });
}
