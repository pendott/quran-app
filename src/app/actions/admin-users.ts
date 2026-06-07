"use server";

import { UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export type AdminUserFormState = { ok: boolean; error: string | null };

const emptyState: AdminUserFormState = { ok: false, error: null };

function revalidateUserPaths() {
  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
}

const createTeacherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  headline: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().min(1).default("Asia/Kuala_Lumpur"),
  isAcceptingBookings: z.coerce.boolean(),
});

export async function adminCreateTeacherAction(
  _prev: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = createTeacherSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    timezone: formData.get("timezone") || "Asia/Kuala_Lumpur",
    isAcceptingBookings: formData.get("isAcceptingBookings") === "on",
  });
  if (!parsed.success) return { ok: false, error: "Invalid form" };

  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, error: "Email already registered" };
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash,
          role: UserRole.TEACHER,
          status: UserStatus.ACTIVE,
          timezone: parsed.data.timezone,
        },
      });
      await tx.teacher.create({
        data: {
          userId: user.id,
          headline: parsed.data.headline || null,
          bio: parsed.data.bio || null,
          timezone: parsed.data.timezone,
          isAcceptingBookings: parsed.data.isAcceptingBookings,
        },
      });
    });
    revalidateUserPaths();
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create teacher" };
  }
}

const updateTeacherSchema = z.object({
  teacherId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.nativeEnum(UserStatus),
  headline: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().min(1),
  experienceYears: z.coerce.number().int().min(0).max(60),
  maxStudents: z.coerce.number().int().min(1).max(500),
  isAcceptingBookings: z.coerce.boolean(),
  newPassword: z.string().optional(),
});

export async function adminUpdateTeacherAction(
  _prev: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = updateTeacherSchema.safeParse({
    teacherId: formData.get("teacherId"),
    name: formData.get("name"),
    email: formData.get("email"),
    status: formData.get("status"),
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    timezone: formData.get("timezone"),
    experienceYears: formData.get("experienceYears"),
    maxStudents: formData.get("maxStudents"),
    isAcceptingBookings: formData.get("isAcceptingBookings") === "on",
    newPassword: String(formData.get("newPassword") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid form" };

  const teacher = await prisma.teacher.findUnique({
    where: { id: parsed.data.teacherId },
    include: { user: true },
  });
  if (!teacher) return { ok: false, error: "Teacher not found" };

  const email = parsed.data.email.toLowerCase();
  if (email !== teacher.user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return { ok: false, error: "Email already in use" };
  }

  if (parsed.data.newPassword && parsed.data.newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  try {
    const passwordHash = parsed.data.newPassword
      ? await hash(parsed.data.newPassword, 12)
      : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: teacher.userId },
        data: {
          name: parsed.data.name,
          email,
          status: parsed.data.status,
          timezone: parsed.data.timezone,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
      await tx.teacher.update({
        where: { id: teacher.id },
        data: {
          headline: parsed.data.headline || null,
          bio: parsed.data.bio || null,
          timezone: parsed.data.timezone,
          experienceYears: parsed.data.experienceYears,
          maxStudents: parsed.data.maxStudents,
          isAcceptingBookings: parsed.data.isAcceptingBookings,
        },
      });
    });

    revalidateUserPaths();
    revalidatePath(`/admin/teachers/${teacher.id}/edit`);
    revalidatePath(`/admin/teachers/${teacher.id}/availability`);
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save teacher" };
  }
}

const updateParentSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.nativeEnum(UserStatus),
  billingEmail: z.string().email().optional().or(z.literal("")),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function adminUpdateParentAction(
  _prev: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = updateParentSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
    status: formData.get("status"),
    billingEmail: String(formData.get("billingEmail") ?? "").trim(),
    emergencyContact: String(formData.get("emergencyContact") ?? "").trim() || undefined,
    notes: String(formData.get("notes") ?? "").trim() || undefined,
    newPassword: String(formData.get("newPassword") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid form" };

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    include: { parentProfile: true },
  });
  if (!user || user.role !== UserRole.PARENT || !user.parentProfile) {
    return { ok: false, error: "Parent not found" };
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return { ok: false, error: "Email already in use" };
  }

  if (parsed.data.newPassword && parsed.data.newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const billingEmail =
    parsed.data.billingEmail && parsed.data.billingEmail.includes("@")
      ? parsed.data.billingEmail.toLowerCase()
      : null;

  try {
    const passwordHash = parsed.data.newPassword
      ? await hash(parsed.data.newPassword, 12)
      : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: parsed.data.name,
          email,
          status: parsed.data.status,
          ...(passwordHash ? { passwordHash } : {}),
        },
      });
      await tx.parentProfile.update({
        where: { id: user.parentProfile!.id },
        data: {
          billingEmail,
          emergencyContact: parsed.data.emergencyContact || null,
          notes: parsed.data.notes || null,
        },
      });
    });

    revalidateUserPaths();
    revalidatePath(`/admin/parents/${user.id}/edit`);
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save parent" };
  }
}

const addStudentSchema = z.object({
  parentUserId: z.string().min(1),
  studentName: z.string().min(1),
});

export async function adminAddStudentToParentAction(
  _prev: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = addStudentSchema.safeParse({
    parentUserId: formData.get("parentUserId"),
    studentName: formData.get("studentName"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid form" };

  const parent = await prisma.parentProfile.findFirst({
    where: { userId: parsed.data.parentUserId },
  });
  if (!parent) return { ok: false, error: "Parent not found" };

  try {
    await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: { displayName: parsed.data.studentName },
      });
      await tx.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: student.id,
          relation: "parent",
        },
      });
    });
    revalidateUserPaths();
    revalidatePath(`/admin/parents/${parsed.data.parentUserId}/edit`);
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not add student" };
  }
}

const updateStudentSchema = z.object({
  studentId: z.string().min(1),
  displayName: z.string().min(1),
  learningLevel: z.string().optional(),
  currentSurah: z.string().optional(),
  currentAyah: z.string().optional(),
  timezone: z.string().min(1),
  isActive: z.coerce.boolean(),
  primaryTeacherId: z.string().optional(),
  linkParentProfileId: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function adminUpdateStudentAction(
  _prev: AdminUserFormState,
  formData: FormData,
): Promise<AdminUserFormState> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized" };
  }

  const parsed = updateStudentSchema.safeParse({
    studentId: formData.get("studentId"),
    displayName: formData.get("displayName"),
    learningLevel: String(formData.get("learningLevel") ?? "").trim() || undefined,
    currentSurah: String(formData.get("currentSurah") ?? "").trim() || undefined,
    currentAyah: String(formData.get("currentAyah") ?? "").trim() || undefined,
    timezone: formData.get("timezone") || "Asia/Kuala_Lumpur",
    isActive: formData.get("isActive") === "on",
    primaryTeacherId: String(formData.get("primaryTeacherId") ?? "").trim() || undefined,
    linkParentProfileId: String(formData.get("linkParentProfileId") ?? "").trim() || undefined,
    newPassword: String(formData.get("newPassword") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid form" };

  const student = await prisma.student.findUnique({
    where: { id: parsed.data.studentId },
    include: { user: true },
  });
  if (!student) return { ok: false, error: "Student not found" };

  if (parsed.data.newPassword) {
    if (!student.userId) {
      return { ok: false, error: "This student has no login account to reset" };
    }
    if (parsed.data.newPassword.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters" };
    }
  }

  try {
    const passwordHash =
      parsed.data.newPassword && student.userId ? await hash(parsed.data.newPassword, 12) : undefined;

    await prisma.$transaction(async (tx) => {
      if (passwordHash && student.userId) {
        await tx.user.update({
          where: { id: student.userId },
          data: { passwordHash },
        });
      }

      await tx.student.update({
        where: { id: student.id },
        data: {
          displayName: parsed.data.displayName,
          learningLevel: parsed.data.learningLevel || null,
          currentSurah: parsed.data.currentSurah || null,
          currentAyah: parsed.data.currentAyah || null,
          timezone: parsed.data.timezone,
          isActive: parsed.data.isActive,
        },
      });

      if (parsed.data.linkParentProfileId) {
        const parent = await tx.parentProfile.findUnique({
          where: { id: parsed.data.linkParentProfileId },
        });
        if (parent) {
          await tx.parentStudent.upsert({
            where: {
              parentId_studentId: {
                parentId: parent.id,
                studentId: student.id,
              },
            },
            create: {
              parentId: parent.id,
              studentId: student.id,
              relation: "parent",
            },
            update: {},
          });
        }
      }

      const teacherId = parsed.data.primaryTeacherId;
      const active = await tx.studentTeacherAssignment.findMany({
        where: { studentId: student.id, endsAt: null },
      });

      if (!teacherId) {
        if (active.length) {
          await tx.studentTeacherAssignment.updateMany({
            where: { studentId: student.id, endsAt: null },
            data: { endsAt: new Date() },
          });
        }
      } else {
        const already = active.find((a) => a.teacherId === teacherId);
        if (!already) {
          await tx.studentTeacherAssignment.updateMany({
            where: { studentId: student.id, endsAt: null },
            data: { endsAt: new Date() },
          });
          await tx.studentTeacherAssignment.create({
            data: {
              studentId: student.id,
              teacherId,
              isPrimary: true,
            },
          });
        }
      }
    });

    revalidateUserPaths();
    revalidatePath(`/admin/students/${student.id}/edit`);
    return { ok: true, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not save student" };
  }
}

export { emptyState as adminUserFormInitial };
