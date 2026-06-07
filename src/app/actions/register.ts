"use server";

import { UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

export type RegisterState = { ok: boolean; error: string | null };

const baseSchema = z.object({
  accountType: z.enum(["student", "parent"]),
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  learnerName: z.string().optional(),
});

export async function registerAccountAction(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = baseSchema.safeParse({
    accountType: formData.get("accountType"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    learnerName: formData.get("learnerName") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "This email is already registered. Sign in instead." };
  }

  const isParent = parsed.data.accountType === "parent";
  const learnerName = isParent
    ? parsed.data.learnerName?.trim()
    : parsed.data.learnerName?.trim() || parsed.data.name.trim();

  if (!learnerName || learnerName.length < 2) {
    return {
      ok: false,
      error: isParent ? "Learner name is required for parent accounts" : "Learner name is required",
    };
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name.trim(),
          email,
          passwordHash,
          role: isParent ? UserRole.PARENT : UserRole.STUDENT,
          status: UserStatus.ACTIVE,
        },
      });

      if (isParent) {
        const parent = await tx.parentProfile.create({
          data: {
            userId: user.id,
            billingEmail: email,
          },
        });
        const student = await tx.student.create({
          data: { displayName: learnerName },
        });
        await tx.parentStudent.create({
          data: {
            parentId: parent.id,
            studentId: student.id,
            relation: "parent",
          },
        });
        return;
      }

      await tx.student.create({
        data: {
          userId: user.id,
          displayName: learnerName,
        },
      });
    });

    return { ok: true, error: null };
  } catch (e) {
    console.error("registerAccountAction", e);
    return { ok: false, error: "Could not create account. Please try again." };
  }
}
