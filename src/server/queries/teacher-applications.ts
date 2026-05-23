import { TeacherApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  labelHeardFrom,
  labelIdDocumentType,
  labelLanguageMode,
  labelStudentLevel,
  labelTeachingSubject,
} from "@/lib/teacher-application/types";
import type { ProposedAvailability } from "@/lib/teacher-application/types";
import { formatWeekday } from "@/lib/availability/constants";

export async function getAdminTeacherApplications(status?: TeacherApplicationStatus) {
  try {
    const rows = await prisma.teacherApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return {
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        submitted: r.createdAt.toLocaleDateString("en-MY"),
        subjects: (r.teachingSubjects as string[]).map(labelTeachingSubject).join(", "),
      })),
      dbError: false as const,
    };
  } catch {
    return { rows: [], dbError: true as const };
  }
}

export async function getAdminTeacherApplicationDetail(id: string) {
  try {
    const app = await prisma.teacherApplication.findUnique({ where: { id } });
    if (!app) return { application: null, dbError: false as const };

    const availability = app.proposedAvailability as ProposedAvailability;
    const slots = availability.slots.map(
      (s) => `${formatWeekday(s.dayOfWeek)} ${s.startTime}–${s.endTime}`,
    );

    return {
      application: {
        ...app,
        teachingSubjectLabels: (app.teachingSubjects as string[]).map(labelTeachingSubject),
        studentLevelLabels: (app.studentLevels as string[]).map(labelStudentLevel),
        languageLabels: (app.languages as string[]).map(labelLanguageMode),
        heardFromLabel: labelHeardFrom(app.heardFrom, app.heardFromOther),
        idDocumentTypeLabel: labelIdDocumentType(app.idDocumentType),
        availabilitySummary: slots.join(" · ") || "—",
        availability,
      },
      dbError: false as const,
    };
  } catch {
    return { application: null, dbError: true as const };
  }
}
