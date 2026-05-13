"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTeacherByUserId } from "@/server/queries/teacher";

const noteSchema = z.object({
  sessionId: z.string().min(1),
  lastSurah: z.string().optional(),
  lastAyahFrom: z.string().optional(),
  lastAyahTo: z.string().optional(),
  homework: z.string().optional(),
  nextTarget: z.string().optional(),
  summary: z.string().optional(),
});

export async function saveClassNoteAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Not signed in" };

  const parsed = noteSchema.safeParse({
    sessionId: formData.get("sessionId"),
    lastSurah: formData.get("lastSurah") || undefined,
    lastAyahFrom: formData.get("lastAyahFrom") || undefined,
    lastAyahTo: formData.get("lastAyahTo") || undefined,
    homework: formData.get("homework") || undefined,
    nextTarget: formData.get("nextTarget") || undefined,
    summary: formData.get("summary") || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid note" };

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) return { ok: false as const, error: "Not a teacher" };

  const cs = await prisma.classSession.findUnique({
    where: { id: parsed.data.sessionId },
    include: { student: true },
  });
  if (!cs || cs.teacherId !== teacher.id) return { ok: false as const, error: "Forbidden" };

  const { sessionId, ...rest } = parsed.data;

  await prisma.classNote.upsert({
    where: { classSessionId: sessionId },
    create: {
      classSessionId: sessionId,
      studentId: cs.studentId,
      teacherId: teacher.id,
      lastSurah: rest.lastSurah,
      lastAyahFrom: rest.lastAyahFrom,
      lastAyahTo: rest.lastAyahTo,
      homework: rest.homework,
      nextTarget: rest.nextTarget,
      summary: rest.summary,
    },
    update: {
      lastSurah: rest.lastSurah,
      lastAyahFrom: rest.lastAyahFrom,
      lastAyahTo: rest.lastAyahTo,
      homework: rest.homework,
      nextTarget: rest.nextTarget,
      summary: rest.summary,
    },
  });

  if (rest.lastSurah) {
    await prisma.student.update({
      where: { id: cs.studentId },
      data: { currentSurah: rest.lastSurah, currentAyah: rest.lastAyahFrom ?? undefined },
    });
  }

  revalidatePath("/teacher/students");
  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/session/${sessionId}`);
  revalidatePath("/students");
  return { ok: true as const, error: null as string | null };
}
