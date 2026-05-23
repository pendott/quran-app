"use server";

import { TeacherApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { approveTeacherApplication } from "@/server/teacher-application/approve";

export type AdminApplicationActionState = { ok: boolean; error: string | null; tempPassword?: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

const approveSchema = z.object({
  applicationId: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function adminApproveTeacherApplicationAction(
  _prev: AdminApplicationActionState,
  formData: FormData,
): Promise<AdminApplicationActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = approveSchema.safeParse({
    applicationId: formData.get("applicationId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const result = await approveTeacherApplication({
    applicationId: parsed.data.applicationId,
    password: parsed.data.password,
    reviewedByUserId: session.user.id,
  });

  if ("error" in result) {
    return { ok: false, error: result.error ?? "Could not approve application" };
  }

  revalidatePath("/admin/teacher-applications");
  revalidatePath(`/admin/teacher-applications/${parsed.data.applicationId}`);
  revalidatePath("/admin/teachers");
  revalidatePath(`/admin/teachers/${result.teacherId}/availability`);

  return { ok: true, error: null };
}

const rejectSchema = z.object({
  applicationId: z.string().min(1),
  rejectionReason: z.string().optional(),
});

export async function adminRejectTeacherApplicationAction(
  _prev: AdminApplicationActionState,
  formData: FormData,
): Promise<AdminApplicationActionState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = rejectSchema.safeParse({
    applicationId: formData.get("applicationId"),
    rejectionReason: formData.get("rejectionReason") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid form" };

  const application = await prisma.teacherApplication.findUnique({
    where: { id: parsed.data.applicationId },
  });
  if (!application) return { ok: false, error: "Application not found" };
  if (application.status !== TeacherApplicationStatus.PENDING) {
    return { ok: false, error: "Application already reviewed" };
  }

  await prisma.teacherApplication.update({
    where: { id: application.id },
    data: {
      status: TeacherApplicationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedByUserId: session.user.id,
      rejectionReason: parsed.data.rejectionReason?.trim() || null,
    },
  });

  revalidatePath("/admin/teacher-applications");
  revalidatePath(`/admin/teacher-applications/${application.id}`);

  return { ok: true, error: null };
}
