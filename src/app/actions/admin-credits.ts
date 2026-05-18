"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { grantCreditsToStudent } from "@/server/credits/grant-credits";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export type AdminCreditsFormState = { ok: boolean; error: string | null; message: string | null };

export const adminCreditsFormInitial: AdminCreditsFormState = {
  ok: false,
  error: null,
  message: null,
};

const grantSchema = z.object({
  studentId: z.string().min(1),
  credits: z.coerce.number().int().min(1).max(500),
  note: z.string().max(500).optional(),
  expiresInDays: z.coerce.number().int().min(0).max(730).optional(),
});

export async function adminGrantCreditsAction(
  _prev: AdminCreditsFormState,
  formData: FormData,
): Promise<AdminCreditsFormState> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized", message: null };
  }

  const parsed = grantSchema.safeParse({
    studentId: formData.get("studentId"),
    credits: formData.get("credits"),
    note: String(formData.get("note") ?? "").trim() || undefined,
    expiresInDays: formData.get("expiresInDays") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid form", message: null };
  }

  const result = await grantCreditsToStudent({
    studentId: parsed.data.studentId,
    credits: parsed.data.credits,
    grantedByAdminId: session.user.id,
    note: parsed.data.note,
    expiresInDays: parsed.data.expiresInDays && parsed.data.expiresInDays > 0 ? parsed.data.expiresInDays : 365,
  });

  if (!result.ok) {
    return { ok: false, error: result.error, message: null };
  }

  revalidatePath("/admin/credits");
  revalidatePath("/admin/students");
  revalidatePath("/admin/payments");
  revalidatePath(`/admin/students/${parsed.data.studentId}/edit`);
  revalidatePath("/students");
  revalidatePath("/students/bookings");
  revalidatePath("/students/payments");

  return {
    ok: true,
    error: null,
    message: `Added ${parsed.data.credits} credit(s). Student now has ${result.remainingCredits} remaining.`,
  };
}
