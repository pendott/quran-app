import { PrismaClient } from "@prisma/client";
import { ensureDemoAccounts, printDemoLoginHelp } from "./demo-accounts";

const prisma = new PrismaClient();

async function main() {
  await ensureDemoAccounts(prisma);
  printDemoLoginHelp();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
