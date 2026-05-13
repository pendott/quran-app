import { PrismaClient, BookingStatus, PackageType, PaymentStatus, PricingRuleType, SessionStatus, UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { addDays, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DevPass123!";

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  await prisma.classNote.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.meetingLink.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.packageCreditUsage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.packagePurchase.deleteMany();
  await prisma.package.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.teacherAvailability.deleteMany();
  await prisma.studentTeacherAssignment.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.cancellationRule.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.local",
      name: "Demo Admin",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@demo.local",
      name: "Ustaz Ahmad",
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      headline: "Tajwid & memorization",
      bio: "10+ years teaching children and adults online.",
      experienceYears: 10,
      isAcceptingBookings: true,
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@demo.local",
      name: "Nur Aina",
      role: UserRole.PARENT,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const parentProfile = await prisma.parentProfile.create({
    data: {
      userId: parentUser.id,
      billingEmail: "parent@demo.local",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@demo.local",
      name: "Yusuf Hakim",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const studentWithParent = await prisma.student.create({
    data: {
      displayName: "Aisyah Musa",
      learningLevel: "Intermediate",
      currentSurah: "Al-Mulk",
      currentAyah: "1–12",
      isActive: true,
    },
  });

  const studentWithAccount = await prisma.student.create({
    data: {
      userId: studentUser.id,
      displayName: "Yusuf Hakim",
      learningLevel: "Beginner",
      currentSurah: "Iqra",
      currentAyah: "Book 5",
      isActive: true,
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: parentProfile.id,
      studentId: studentWithParent.id,
      relation: "Mother",
    },
  });

  await prisma.studentTeacherAssignment.createMany({
    data: [
      { teacherId: teacher.id, studentId: studentWithParent.id, isPrimary: true },
      { teacherId: teacher.id, studentId: studentWithAccount.id, isPrimary: true },
    ],
  });

  await prisma.teacherAvailability.createMany({
    data: [
      {
        teacherId: teacher.id,
        type: "RECURRING",
        dayOfWeek: 1,
        startTime: "18:00",
        endTime: "21:00",
        slotDurationMinutes: 60,
      },
      {
        teacherId: teacher.id,
        type: "RECURRING",
        dayOfWeek: 3,
        startTime: "18:00",
        endTime: "20:00",
        slotDurationMinutes: 60,
      },
    ],
  });

  const perSession = await prisma.pricingRule.create({
    data: {
      name: "Single session",
      type: PricingRuleType.PER_SESSION,
      currency: "MYR",
      price: 45,
      sessionCount: 1,
      isActive: true,
    },
  });

  const bundle4 = await prisma.pricingRule.create({
    data: {
      name: "4-session bundle",
      type: PricingRuleType.PACKAGE,
      currency: "MYR",
      price: 160,
      sessionCount: 4,
      isActive: true,
    },
  });

  const pkg4 = await prisma.package.create({
    data: {
      name: "4 classes",
      type: PackageType.SESSION_BUNDLE,
      currency: "MYR",
      price: 160,
      sessionCredits: 4,
      durationDays: 90,
      isActive: true,
      pricingRuleId: bundle4.id,
    },
  });

  await prisma.packagePurchase.create({
    data: {
      packageId: pkg4.id,
      studentId: studentWithParent.id,
      purchasedById: parentUser.id,
      status: "ACTIVE",
      totalCredits: 4,
      usedCredits: 0,
    },
  });

  const tomorrow = setMinutes(setHours(addDays(new Date(), 1), 11), 0);
  const sessionEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      studentId: studentWithParent.id,
      teacherId: teacher.id,
      bookedById: parentUser.id,
      pricingRuleId: perSession.id,
      status: BookingStatus.CONFIRMED,
      scheduledStartAt: tomorrow,
      scheduledEndAt: sessionEnd,
      durationMinutes: 60,
      amountDue: 45,
      currency: "MYR",
    },
  });

  const classSession = await prisma.classSession.create({
    data: {
      bookingId: booking.id,
      studentId: studentWithParent.id,
      teacherId: teacher.id,
      status: SessionStatus.SCHEDULED,
      scheduledStartAt: tomorrow,
      scheduledEndAt: sessionEnd,
    },
  });

  await prisma.meetingLink.create({
    data: {
      classSessionId: classSession.id,
      provider: "MANUAL",
      joinUrl: "https://example.com/demo-meeting",
    },
  });

  await prisma.payment.create({
    data: {
      payerId: parentUser.id,
      studentId: studentWithParent.id,
      bookingId: booking.id,
      status: PaymentStatus.PENDING,
      amount: 45,
      currency: "MYR",
      provider: "MANUAL",
    },
  });

  await prisma.cancellationRule.create({
    data: {
      name: "Standard",
      noticeHours: 24,
      refundPercentage: 100,
      allowReschedule: true,
      maxReschedules: 2,
      packageCreditRefund: true,
      isActive: true,
    },
  });

  console.log("Seed complete. Demo password for all accounts:", DEMO_PASSWORD);
  console.log({
    admin: admin.email,
    teacher: teacherUser.email,
    parent: parentUser.email,
    student: studentUser.email,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
