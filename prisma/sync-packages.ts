import { PrismaClient } from "@prisma/client";
import { syncPackageCatalog } from "@/server/packages/sync-catalog";

const prisma = new PrismaClient();

async function main() {
  await syncPackageCatalog(prisma);
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    select: { name: true, price: true, sessionCredits: true },
  });
  console.log("\n=== Payment packages synced ===");
  for (const pkg of packages) {
    console.log(`  ${pkg.name}: RM${pkg.price} (${pkg.sessionCredits} credit(s))`);
  }
  console.log("");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
