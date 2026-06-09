import {
  IdDocumentType,
  PrismaClient,
  TeacherApplicationStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { syncPackageCatalog } from "../src/server/packages/sync-catalog";

export const DEMO_PASSWORD = "DevPass123!";

export const DEMO_ACCOUNTS = {
  admin: { email: "admin@demo.local", name: "Demo Admin", phone: "+60 12-000 1001" },
  teacher: { email: "teacher@demo.local", name: "Ustaz Ahmad", phone: "+60 12-345 6789" },
  parent: { email: "parent@demo.local", name: "Nur Aina", phone: "+60 12-111 2233" },
  student: { email: "student@demo.local", name: "Yusuf Hakim", phone: "+60 17-555 1234" },
} as const;

const DEMO_EVENING_SLOTS = [
  { startTime: "18:00", endTime: "19:00" },
  { startTime: "19:15", endTime: "20:15" },
  { startTime: "20:30", endTime: "21:30" },
  { startTime: "21:45", endTime: "22:45" },
] as const;

const DEMO_WEEKDAYS = [1, 2, 3, 4, 5] as const;

type Db = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;

export async function ensureDemoAccounts(db: Db | PrismaClient = new PrismaClient()) {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const admin = await db.user.upsert({
    where: { email: DEMO_ACCOUNTS.admin.email },
    create: {
      ...DEMO_ACCOUNTS.admin,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
    update: {
      name: DEMO_ACCOUNTS.admin.name,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const teacherUser = await db.user.upsert({
    where: { email: DEMO_ACCOUNTS.teacher.email },
    create: {
      ...DEMO_ACCOUNTS.teacher,
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
    update: {
      name: DEMO_ACCOUNTS.teacher.name,
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const teacher = await db.teacher.upsert({
    where: { userId: teacherUser.id },
    create: {
      userId: teacherUser.id,
      legalName: "Ahmad bin Abdullah",
      idDocumentType: IdDocumentType.IC,
      idDocumentNumber: "900101015432",
      age: 34,
      headline: "Tajwid, hifz & kids classes",
      bio: "Assalamu alaikum. I have taught Quran online for over 10 years.",
      qualifications: "Ijazah in Tajwid (Darul Quran, 2014).",
      teachingSubjects: ["tajwid", "quran_recitation", "hifz", "kids_beginners", "adults"],
      studentLevels: ["beginner", "intermediate", "kids_8_12", "teens", "adults_only"],
      languages: ["malay", "english"],
      maxStudentsPerWeek: 12,
      experienceYears: 10,
      isAcceptingBookings: true,
    },
    update: {
      isAcceptingBookings: true,
    },
  });

  const availabilityCount = await db.teacherAvailability.count({ where: { teacherId: teacher.id } });
  if (availabilityCount === 0) {
    await db.teacherAvailability.createMany({
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
  }

  const parentUser = await db.user.upsert({
    where: { email: DEMO_ACCOUNTS.parent.email },
    create: {
      ...DEMO_ACCOUNTS.parent,
      role: UserRole.PARENT,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
    update: {
      name: DEMO_ACCOUNTS.parent.name,
      role: UserRole.PARENT,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  const parentProfile = await db.parentProfile.upsert({
    where: { userId: parentUser.id },
    create: {
      userId: parentUser.id,
      billingEmail: DEMO_ACCOUNTS.parent.email,
      emergencyContact: "Encik Musa (husband) +60 12-999 8877",
    },
    update: {
      billingEmail: DEMO_ACCOUNTS.parent.email,
    },
  });

  let childStudent = await db.student.findFirst({
    where: {
      displayName: "Aisyah Musa",
      parents: { some: { parentId: parentProfile.id } },
    },
  });
  if (!childStudent) {
    childStudent = await db.student.create({
      data: {
        displayName: "Aisyah Musa",
        learningLevel: "Intermediate",
        currentSurah: "Al-Mulk",
        currentAyah: "1–12",
        isActive: true,
      },
    });
    await db.parentStudent.upsert({
      where: {
        parentId_studentId: { parentId: parentProfile.id, studentId: childStudent.id },
      },
      create: {
        parentId: parentProfile.id,
        studentId: childStudent.id,
        relation: "Mother",
      },
      update: {},
    });
  }

  const studentUser = await db.user.upsert({
    where: { email: DEMO_ACCOUNTS.student.email },
    create: {
      ...DEMO_ACCOUNTS.student,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      passwordHash,
      timezone: "Asia/Kuala_Lumpur",
    },
    update: {
      name: DEMO_ACCOUNTS.student.name,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });

  let learnerStudent = await db.student.findFirst({ where: { userId: studentUser.id } });
  if (!learnerStudent) {
    learnerStudent = await db.student.findFirst({
      where: { displayName: "Yusuf Hakim", userId: null },
    });
    if (learnerStudent) {
      learnerStudent = await db.student.update({
        where: { id: learnerStudent.id },
        data: { userId: studentUser.id },
      });
    } else {
      learnerStudent = await db.student.create({
        data: {
          userId: studentUser.id,
          displayName: "Yusuf Hakim",
          learningLevel: "Beginner",
          currentSurah: "Iqra",
          currentAyah: "Book 5",
          isActive: true,
        },
      });
    }
  }

  for (const studentId of [childStudent.id, learnerStudent.id]) {
    const assigned = await db.studentTeacherAssignment.findFirst({
      where: { studentId, teacherId: teacher.id, endsAt: null },
    });
    if (!assigned) {
      await db.studentTeacherAssignment.create({
        data: { studentId, teacherId: teacher.id, isPrimary: true },
      });
    }
  }

  await syncPackageCatalog(db);

  const hasCancellationRule = await db.cancellationRule.findFirst({ where: { name: "Standard", isActive: true } });
  if (!hasCancellationRule) {
    await db.cancellationRule.create({
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
  }

  const existingApplication = await db.teacherApplication.findFirst({
    where: { email: teacherUser.email },
  });
  if (!existingApplication) {
    await db.teacherApplication.create({
      data: {
        email: teacherUser.email,
        name: teacherUser.name!,
        legalName: "Ahmad bin Abdullah",
        idDocumentType: IdDocumentType.IC,
        idDocumentNumber: "900101015432",
        phone: teacherUser.phone,
        age: 34,
        qualifications: "Ijazah in Tajwid (Darul Quran, 2014).",
        experienceYears: 10,
        about: teacher.bio ?? "Demo teacher",
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
  }

  console.log("\n=== Demo accounts ready ===");
  console.log("Password for all:", DEMO_PASSWORD);
  console.log("");
  console.log("| Role    | Email               |");
  console.log("|---------|---------------------|");
  console.log("| Admin   | admin@demo.local    |");
  console.log("| Teacher | teacher@demo.local  |");
  console.log("| Parent  | parent@demo.local   |");
  console.log("| Student | student@demo.local  |");
  console.log("");
  console.log("Admin user id:", admin.id);

  return { admin, teacherUser, parentUser, studentUser, teacher };
}

export function printDemoLoginHelp() {
  console.log("\nRe-run: npm run db:ensure-demo");
  console.log("Full reset with sample bookings: npm run db:seed\n");
}
