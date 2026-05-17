"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getTeacherByUserId } from "@/server/queries/teacher";

async function resolveTeacherId(formTeacherId: string | null, asAdmin: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" as const };

  if (asAdmin && session.user.role === "ADMIN") {
    if (!formTeacherId) return { error: "Missing teacher" as const };
    const t = await prisma.teacher.findUnique({ where: { id: formTeacherId } });
    if (!t) return { error: "Teacher not found" as const };
    return { teacherId: formTeacherId };
  }

  if (session.user.role !== "TEACHER") {
    return { error: "Not authorized" as const };
  }

  const teacher = await getTeacherByUserId(session.user.id);
  if (!teacher) return { error: "No teacher profile" as const };
  if (formTeacherId && formTeacherId !== teacher.id) {
    return { error: "Not authorized" as const };
  }
  return { teacherId: teacher.id };
}

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createSchema = z.object({
  teacherId: z.string().optional(),
  asAdmin: z.string().optional(),
  type: z.enum(["RECURRING", "EXCEPTION"]),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  specificDate: z.string().optional(),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  slotDurationMinutes: z.coerce.number().int().min(15).max(180),
  month: z.string().optional(),
});

function revalidateAvailabilityPaths(teacherId: string, asAdmin: boolean) {
  revalidatePath("/teacher/availability");
  revalidatePath("/students/bookings");
  if (asAdmin) {
    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${teacherId}/availability`);
  }
}

export type AvailabilityFormState = { ok: boolean; error: string | null };

export async function createAvailabilityAction(
  _prev: AvailabilityFormState | undefined,
  formData: FormData,
): Promise<AvailabilityFormState> {
  const asAdmin = formData.get("asAdmin") === "1";
  const resolved = await resolveTeacherId(String(formData.get("teacherId") ?? "") || null, asAdmin);
  if ("error" in resolved) return { ok: false, error: resolved.error ?? "Not authorized" };

  const parsed = createSchema.safeParse({
    teacherId: formData.get("teacherId"),
    asAdmin: formData.get("asAdmin"),
    type: formData.get("type"),
    dayOfWeek: formData.get("dayOfWeek"),
    specificDate: formData.get("specificDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    slotDurationMinutes: formData.get("slotDurationMinutes") ?? "60",
    month: formData.get("month"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid form" };
  }

  if (parsed.data.startTime >= parsed.data.endTime) {
    return { ok: false, error: "End time must be after start time" };
  }

  if (parsed.data.type === "RECURRING" && parsed.data.dayOfWeek == null) {
    return { ok: false, error: "Choose a weekday" };
  }

  if (parsed.data.type === "EXCEPTION" && !parsed.data.specificDate) {
    return { ok: false, error: "Choose a date" };
  }

  try {
    await prisma.teacherAvailability.create({
      data: {
        teacherId: resolved.teacherId,
        type: parsed.data.type,
        dayOfWeek: parsed.data.type === "RECURRING" ? parsed.data.dayOfWeek : null,
        specificDate:
          parsed.data.type === "EXCEPTION" && parsed.data.specificDate
            ? new Date(`${parsed.data.specificDate}T12:00:00`)
            : null,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        slotDurationMinutes: parsed.data.slotDurationMinutes,
      },
    });
    revalidateAvailabilityPaths(resolved.teacherId, asAdmin);
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save availability" };
  }
}

export async function deleteAvailabilityAction(formData: FormData): Promise<void> {
  const asAdmin = formData.get("asAdmin") === "1";
  const availabilityId = String(formData.get("availabilityId") ?? "");
  if (!availabilityId) return;

  const row = await prisma.teacherAvailability.findUnique({ where: { id: availabilityId } });
  if (!row) return;

  const resolved = await resolveTeacherId(row.teacherId, asAdmin);
  if ("error" in resolved) return;
  if (resolved.teacherId !== row.teacherId) return;

  await prisma.teacherAvailability.update({
    where: { id: availabilityId },
    data: { isActive: false },
  });

  revalidateAvailabilityPaths(row.teacherId, asAdmin);
}
