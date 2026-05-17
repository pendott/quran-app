"use server";

import { UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  name: z.string().min(1),
  studentName: z.string().min(1),
});

export async function acceptInviteAction(_prev: unknown, formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    name: formData.get("name"),
    studentName: formData.get("studentName"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid form" };
  }

  const user = await prisma.user.findFirst({
    where: {
      inviteToken: parsed.data.token,
      status: UserStatus.INVITED,
      inviteExpiresAt: { gt: new Date() },
    },
  });
  if (!user) {
    return { ok: false as const, error: "Invite expired or invalid" };
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: parsed.data.name,
          passwordHash,
          status: UserStatus.ACTIVE,
          inviteToken: null,
          inviteExpiresAt: null,
        },
      });
      const parent = await tx.parentProfile.create({
        data: {
          userId: user.id,
          billingEmail: user.email,
        },
      });
      const student = await tx.student.create({
        data: { displayName: parsed.data.studentName },
      });
      await tx.parentStudent.create({
        data: { parentId: parent.id, studentId: student.id, relation: "parent" },
      });
    });
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not complete signup" };
  }

  redirect("/login?callbackUrl=/students");
}
