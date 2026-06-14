import { UserRole, PrismaClient } from "@prisma/client";
import { ensureDemoAccounts } from "./demo-accounts";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.ADMIN },
    select: { id: true, email: true, name: true },
  });

  if (admins.length === 0) {
    throw new Error("No admin user found — aborting purge.");
  }

  await prisma.classNote.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.meetingLink.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.packageCreditUsage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.packagePurchase.deleteMany();
  await prisma.teacherAvailability.deleteMany();
  await prisma.studentTeacherAssignment.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.teacherApplication.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.verificationToken.deleteMany();

  const removedUsers = await prisma.user.deleteMany({
    where: { role: { not: UserRole.ADMIN } },
  });

  console.log("\n=== Database purged (admin only) ===");
  console.log("Kept admin account(s):");
  for (const admin of admins) {
    console.log(`  - ${admin.email}${admin.name ? ` (${admin.name})` : ""}`);
  }
  console.log(`Removed ${removedUsers.count} non-admin user(s) and all learner/teacher records.`);

  await ensureDemoAccounts(prisma);

  console.log("Re-created demo teacher, parent, and student accounts for testing.\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
