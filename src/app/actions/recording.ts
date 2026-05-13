"use server";

import { RecordingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTeacherByUserId } from "@/server/queries/teacher";

const base = z.object({
  sessionId: z.string().min(1),
  title: z.string().min(1).max(200),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  visibleToFamily: z.enum(["on"]).optional(),
});

export async function saveSessionRecordingAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Not signed in" };

  const parsed = base.safeParse({
    sessionId: formData.get("sessionId"),
    title: formData.get("title"),
    durationSeconds: formData.get("durationSeconds") || undefined,
    visibleToFamily: formData.get("visibleToFamily") as "on" | undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "Check required fields" };

  const rawUrl = String(formData.get("playbackUrl") ?? "").trim();
  if (rawUrl && !URL.canParse(rawUrl)) return { ok: false as const, error: "Invalid playback URL" };
  const url = rawUrl || null;
  const status = url ? RecordingStatus.AVAILABLE : RecordingStatus.PROCESSING;

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) return { ok: false as const, error: "Not a teacher" };

  const cs = await prisma.classSession.findUnique({ where: { id: parsed.data.sessionId } });
  if (!cs || cs.teacherId !== teacher.id) return { ok: false as const, error: "Forbidden" };

  await prisma.recording.upsert({
    where: { classSessionId: parsed.data.sessionId },
    create: {
      classSessionId: parsed.data.sessionId,
      title: parsed.data.title,
      storageProvider: "MANUAL",
      storagePath: url ?? "pending",
      playbackUrl: url,
      durationSeconds: parsed.data.durationSeconds,
      status,
      visibleToFamily: parsed.data.visibleToFamily === "on",
    },
    update: {
      title: parsed.data.title,
      storagePath: url ?? "pending",
      playbackUrl: url,
      durationSeconds: parsed.data.durationSeconds,
      status,
      visibleToFamily: parsed.data.visibleToFamily === "on",
    },
  });

  revalidatePath(`/teacher/session/${parsed.data.sessionId}`);
  revalidatePath("/students");
  revalidatePath("/students/recordings");
  return { ok: true as const, error: null as string | null };
}
