"use server";

import { AttendanceStatus, BookingStatus, SessionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
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
    const cs = await prisma.classSession.findUnique({
      where: { id: classSessionId },
      select: { bookingId: true },
    });
    const completedAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.classSession.update({
        where: { id: classSessionId },
        data: {
          status: SessionStatus.COMPLETED,
          actualEndAt: completedAt,
          completedAt,
          studentAttendance: AttendanceStatus.PRESENT,
          teacherAttendance: AttendanceStatus.PRESENT,
        },
      });
      if (cs?.bookingId) {
        await tx.booking.updateMany({
          where: { id: cs.bookingId, status: BookingStatus.CONFIRMED },
          data: { status: BookingStatus.COMPLETED },
        });
      }
    });
    revalidatePath("/teacher/classes");
    revalidatePath(`/teacher/session/${classSessionId}`);
  } catch {
    // ignore
  }
}

const attendanceValue = z.nativeEnum(AttendanceStatus);

export async function updateSessionAttendanceAction(formData: FormData): Promise<void> {
  const session = await auth();
  const classSessionId = String(formData.get("sessionId") ?? "");
  const target = String(formData.get("target") ?? "");
  const valueRaw = String(formData.get("value") ?? "");
  if (!session?.user?.id || !classSessionId || (target !== "teacher" && target !== "student")) return;

  const parsed = attendanceValue.safeParse(valueRaw);
  if (!parsed.success) return;

  try {
    await assertTeacherOwnsSession(session.user.id, classSessionId);
    await prisma.classSession.update({
      where: { id: classSessionId },
      data:
        target === "teacher"
          ? { teacherAttendance: parsed.data }
          : { studentAttendance: parsed.data },
    });
    revalidatePath(`/teacher/session/${classSessionId}`);
    revalidatePath("/teacher/classes");
  } catch {
    // ignore
  }
}
