"use server";

import { AttendanceStatus, SessionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTeacherByUserId } from "@/server/queries/teacher";

async function assertTeacherOwnsSession(userId: string, classSessionId: string) {
  const teacher = await getTeacherByUserId(userId);
  if (!teacher) throw new Error("Not a teacher");
  const cs = await prisma.classSession.findUnique({ where: { id: classSessionId } });
  if (!cs || cs.teacherId !== teacher.id) throw new Error("Forbidden");
  return { teacher, cs };
}

export async function startClassSessionAction(formData: FormData): Promise<void> {
  const session = await auth();
  const classSessionId = String(formData.get("sessionId") ?? "");
  if (!session?.user?.id || !classSessionId) return;
  try {
    await assertTeacherOwnsSession(session.user.id, classSessionId);
    await prisma.classSession.update({
      where: { id: classSessionId },
      data: {
        status: SessionStatus.IN_PROGRESS,
        actualStartAt: new Date(),
        startedByUserId: session.user.id,
        teacherAttendance: AttendanceStatus.PRESENT,
      },
    });
    revalidatePath("/teacher/classes");
    revalidatePath(`/teacher/session/${classSessionId}`);
  } catch {
    // ignore — UI can add toast later
  }
}

export async function completeClassSessionAction(formData: FormData): Promise<void> {
  const session = await auth();
  const classSessionId = String(formData.get("sessionId") ?? "");
  if (!session?.user?.id || !classSessionId) return;
  try {
    await assertTeacherOwnsSession(session.user.id, classSessionId);
    await prisma.classSession.update({
      where: { id: classSessionId },
      data: {
        status: SessionStatus.COMPLETED,
        actualEndAt: new Date(),
        completedAt: new Date(),
        studentAttendance: AttendanceStatus.PRESENT,
        teacherAttendance: AttendanceStatus.PRESENT,
      },
    });
    revalidatePath("/teacher/classes");
    revalidatePath(`/teacher/session/${classSessionId}`);
  } catch {
    // ignore
  }
}
