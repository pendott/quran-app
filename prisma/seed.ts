import {
  BookingStatus,
  IdDocumentType,
  PaymentStatus,
  SessionStatus,
  TeacherApplicationStatus,
  UserRole,
  UserStatus,
  PrismaClient,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { addDays, setHours, setMinutes, subDays } from "date-fns";
import { PER_SESSION_PRICING } from "../src/lib/packages/catalog";
import { syncPackageCatalog } from "../src/server/packages/sync-catalog";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DevPass123!";

/** Evening bookable slots (60 min class, 15 min gap) — matches the apply form. */
const DEMO_EVENING_SLOTS = [
  { startTime: "18:00", endTime: "19:00" },
  { startTime: "19:15", endTime: "20:15" },
  { startTime: "20:30", endTime: "21:30" },
  { startTime: "21:45", endTime: "22:45" },
] as const;

const DEMO_WEEKDAYS = [1, 2, 3, 4, 5] as const;

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
  await prisma.teacherApplication.deleteMany();
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
      phone: "+60 12-000 1001",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@demo.local",
      name: "Ustaz Ahmad",
      phone: "+60 12-345 6789",
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      legalName: "Ahmad bin Abdullah",
      idDocumentType: IdDocumentType.IC,
      idDocumentNumber: "900101015432",
      age: 34,
      headline: "Tajwid, hifz & kids classes",
      bio: "Assalamu alaikum. I have taught Quran online for over 10 years, specialising in tajwid correction and gentle hifz coaching for children and adults across Malaysia and Singapore.",
      qualifications:
        "Ijazah in Tajwid (Darul Quran, 2014). Certificate in Quranic Teaching Methods. Former weekend teacher at surau Al-Hidayah, Shah Alam.",
      teachingSubjects: ["tajwid", "quran_recitation", "hifz", "kids_beginners", "adults"],
      studentLevels: ["beginner", "intermediate", "kids_8_12", "teens", "adults_only"],
      languages: ["malay", "english"],
      maxStudentsPerWeek: 12,
      experienceYears: 10,
      isAcceptingBookings: true,
    },
  });

  await prisma.teacherApplication.create({
    data: {
      email: teacherUser.email,
      name: teacherUser.name!,
      legalName: "Ahmad bin Abdullah",
      idDocumentType: IdDocumentType.IC,
      idDocumentNumber: "900101015432",
      phone: teacherUser.phone,
      age: 34,
      qualifications:
        "Ijazah in Tajwid (Darul Quran, 2014). Certificate in Quranic Teaching Methods.",
      experienceYears: 10,
      about: teacher.bio!,
      teachingSubjects: ["tajwid", "quran_recitation", "hifz", "kids_beginners", "adults"],
      studentLevels: ["beginner", "intermediate", "kids_8_12", "teens", "adults_only"],
      languages: ["malay", "english"],
      maxStudentsPerWeek: 12,
      heardFrom: "mosque_community",
      proposedAvailability: {
        timezone: "Asia/Kuala_Lumpur",
        slots: DEMO_WEEKDAYS.flatMap((dayOfWeek) =>
          DEMO_EVENING_SLOTS.map((slot) => ({
            dayOfWeek,
            ...slot,
            slotDurationMinutes: 60,
          })),
        ),
      },
      timezone: "Asia/Kuala_Lumpur",
      status: TeacherApplicationStatus.APPROVED,
      reviewedAt: new Date(),
      confirmedAccurate: true,
      confirmedCodeOfConduct: true,
      consentBackgroundCheck: true,
      createdTeacherId: teacher.id,
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@demo.local",
      name: "Nur Aina",
      phone: "+60 12-111 2233",
      role: UserRole.PARENT,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
  });

  const parentProfile = await prisma.parentProfile.create({
    data: {
      userId: parentUser.id,
      billingEmail: "parent@demo.local",
      emergencyContact: "Encik Musa (husband) +60 12-999 8877",
      notes: "Prefers evening classes after school. Daughter Aisyah is 9 years old.",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@demo.local",
      name: "Yusuf Hakim",
      phone: "+60 17-555 1234",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
  });

  const studentWithParent = await prisma.student.create({
    data: {
      displayName: "Aisyah Musa",
      learningLevel: "Intermediate",
      currentSurah: "Al-Mulk",
      currentAyah: "1–12",
      onboardingNotes: "Completed Juz Amma at school; wants stronger makhraj.",
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
      onboardingNotes: "Adult learner; evening slots preferred.",
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
    data: DEMO_WEEKDAYS.flatMap((dayOfWeek) =>
      DEMO_EVENING_SLOTS.map((slot) => ({
        teacherId: teacher.id,
        type: "RECURRING" as const,
        dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotDurationMinutes: 60,
        timezone: "Asia/Kuala_Lumpur",
      })),
    ),
  });

  await syncPackageCatalog(prisma);

  const perSession = await prisma.pricingRule.findFirst({
    where: { name: PER_SESSION_PRICING.name, isActive: true },
  });
  const pkg4 = await prisma.package.findFirst({ where: { name: "4 classes", isActive: true } });
  if (!perSession || !pkg4) {
    throw new Error("Expected per-session pricing and 4-class package after catalog sync");
  }

  await prisma.packagePurchase.create({
    data: {
      packageId: pkg4.id,
      studentId: studentWithParent.id,
      purchasedById: parentUser.id,
      status: "ACTIVE",
      totalCredits: 4,
      usedCredits: 1,
    },
  });

  await prisma.packagePurchase.create({
    data: {
      packageId: pkg4.id,
      studentId: studentWithAccount.id,
      purchasedById: studentUser.id,
      status: "ACTIVE",
      totalCredits: 4,
      usedCredits: 0,
    },
  });

  const tomorrow = setMinutes(setHours(addDays(new Date(), 1), 19), 15);
  const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  const upcomingBooking = await prisma.booking.create({
    data: {
      studentId: studentWithParent.id,
      teacherId: teacher.id,
      bookedById: parentUser.id,
      pricingRuleId: perSession.id,
      status: BookingStatus.CONFIRMED,
      scheduledStartAt: tomorrow,
      scheduledEndAt: tomorrowEnd,
      durationMinutes: 60,
      amountDue: 45,
      currency: "MYR",
    },
  });

  const upcomingSession = await prisma.classSession.create({
    data: {
      bookingId: upcomingBooking.id,
      studentId: studentWithParent.id,
      teacherId: teacher.id,
      status: SessionStatus.SCHEDULED,
      scheduledStartAt: tomorrow,
      scheduledEndAt: tomorrowEnd,
    },
  });

  await prisma.meetingLink.create({
    data: {
      classSessionId: upcomingSession.id,
      provider: "MANUAL",
      joinUrl: "https://zoom.us/j/demo-aisyah-class",
    },
  });

  await prisma.payment.create({
    data: {
      payerId: parentUser.id,
      studentId: studentWithParent.id,
      bookingId: upcomingBooking.id,
      status: PaymentStatus.PAID,
      amount: 45,
      currency: "MYR",
      provider: "MANUAL",
      paidAt: new Date(),
    },
  });

  const yesterday = setMinutes(setHours(subDays(new Date(), 1), 20), 30);
  const yesterdayEnd = new Date(yesterday.getTime() + 60 * 60 * 1000);

  const pastBooking = await prisma.booking.create({
    data: {
      studentId: studentWithAccount.id,
      teacherId: teacher.id,
      bookedById: studentUser.id,
      pricingRuleId: perSession.id,
      status: BookingStatus.COMPLETED,
      scheduledStartAt: yesterday,
      scheduledEndAt: yesterdayEnd,
      durationMinutes: 60,
      amountDue: 45,
      currency: "MYR",
    },
  });

  const pastSession = await prisma.classSession.create({
    data: {
      bookingId: pastBooking.id,
      studentId: studentWithAccount.id,
      teacherId: teacher.id,
      status: SessionStatus.COMPLETED,
      scheduledStartAt: yesterday,
      scheduledEndAt: yesterdayEnd,
      completedAt: yesterdayEnd,
      actualEndAt: yesterdayEnd,
    },
  });

  await prisma.classNote.create({
    data: {
      classSessionId: pastSession.id,
      studentId: studentWithAccount.id,
      teacherId: teacher.id,
      lastSurah: "Al-Fatiha",
      lastAyahFrom: "1",
      lastAyahTo: "7",
      tajwidMistakes: ["makhraj", "madd"],
      homework: "Practice Al-Fatiha 3 times before next class; review makhraj chart.",
      nextTarget: "Start An-Nas with correct noon sakinah rules.",
      summary: "Great effort today — makhraj of ع and ح improving. Keep practising 10 minutes daily.",
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

  console.log("\n=== jomngaji.my demo accounts ===");
  console.log("Password for all accounts:", DEMO_PASSWORD);
  console.log("");
  console.log("| Role    | Email               | What to try                          |");
  console.log("|---------|---------------------|--------------------------------------|");
  console.log("| Admin   | admin@demo.local    | Teachers, applications, credits      |");
  console.log("| Teacher | teacher@demo.local  | Today schedule, availability, notes  |");
  console.log("| Parent  | parent@demo.local   | Book for Aisyah, package balance     |");
  console.log("| Student | student@demo.local  | Own bookings, progress, past class   |");
  console.log("");
  console.log("Admin user id:", admin.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
