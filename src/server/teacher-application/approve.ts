import { UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import type { ProposedAvailability } from "@/lib/teacher-application/types";

export async function approveTeacherApplication(params: {
  applicationId: string;
  password: string;
  reviewedByUserId: string;
}) {
  const application = await prisma.teacherApplication.findUnique({
    where: { id: params.applicationId },
  });
  if (!application) return { error: "Application not found" as const };
  if (application.status !== "PENDING") {
    return { error: "Application already reviewed" as const };
  }

  const email = application.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "Email already has an account" as const };
  }

  const availability = application.proposedAvailability as ProposedAvailability;
  const teachingSubjects = application.teachingSubjects as string[];
  const studentLevels = application.studentLevels as string[];
  const languages = application.languages as string[];

  const passwordHash = await hash(params.password, 12);

  const teacher = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: application.name,
        email,
        phone: application.phone,
        image: application.photoPath,
        passwordHash,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        timezone: application.timezone,
      },
    });

    const teacherRecord = await tx.teacher.create({
      data: {
        userId: user.id,
        bio: application.about,
        headline: application.qualifications.slice(0, 120),
        age: application.age,
        legalName: application.legalName,
        idDocumentType: application.idDocumentType,
        idDocumentNumber: application.idDocumentNumber,
        qualifications: application.qualifications,
        teachingSubjects,
        studentLevels,
        languages,
        certificationPath: application.certificationPath,
        maxStudentsPerWeek: application.maxStudentsPerWeek,
        maxStudents: Math.max(application.maxStudentsPerWeek, 20),
        timezone: application.timezone,
        experienceYears: application.experienceYears,
        isAcceptingBookings: true,
      },
    });

    for (const slot of availability.slots) {
      await tx.teacherAvailability.create({
        data: {
          teacherId: teacherRecord.id,
          type: "RECURRING",
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotDurationMinutes: slot.slotDurationMinutes ?? 60,
          timezone: availability.timezone,
        },
      });
    }

    await tx.teacherApplication.update({
      where: { id: application.id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedByUserId: params.reviewedByUserId,
        createdTeacherId: teacherRecord.id,
      },
    });

    return teacherRecord;
  });

  return { teacherId: teacher.id };
}
