import Link from "next/link";
import { createElement, Fragment } from "react";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailable } from "@/server/db-guard";
import type { TableRow } from "@/lib/types";

export type AdminParentListRow = {
  userId: string;
  name: string;
  email: string;
  status: string;
  studentCount: number;
};

export type AdminParentForEdit = {
  userId: string;
  name: string;
  email: string;
  status: string;
  billingEmail: string | null;
  emergencyContact: string | null;
  notes: string | null;
  students: { id: string; displayName: string; isActive: boolean }[];
};

export type AdminStudentForEdit = {
  id: string;
  displayName: string;
  learningLevel: string | null;
  currentSurah: string | null;
  currentAyah: string | null;
  timezone: string;
  isActive: boolean;
  primaryTeacherId: string | null;
  linkedParentProfileId: string | null;
  parents: { profileId: string; name: string }[];
};

export type AdminTeacherForEdit = {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  headline: string | null;
  bio: string | null;
  timezone: string;
  experienceYears: number;
  maxStudents: number;
  isAcceptingBookings: boolean;
};

export type AdminUserPickerParent = { profileId: string; label: string };
export type AdminUserPickerTeacher = { id: string; label: string };

export async function getAdminParentsList(): Promise<{
  parents: AdminParentListRow[];
  dbError: boolean;
}> {
  try {
    const profiles = await prisma.parentProfile.findMany({
      orderBy: { user: { name: "asc" } },
      include: {
        user: true,
        students: { include: { student: true } },
      },
    });

    const parents: AdminParentListRow[] = profiles.map((p) => ({
      userId: p.userId,
      name: p.user.name ?? p.user.email,
      email: p.user.email,
      status: p.user.status,
      studentCount: p.students.length,
    }));

    return { parents, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { parents: [], dbError: true };
  }
}

export async function getAdminParentsTableRows(): Promise<{ rows: TableRow[]; dbError: boolean }> {
  const { parents, dbError } = await getAdminParentsList();
  const rows: TableRow[] = parents.map((p) => ({
    Parent: p.name,
    Email: p.email,
    Students: String(p.studentCount),
    Status: p.status.replace(/_/g, " "),
    Manage: createElement(
      Link,
      {
        href: `/admin/parents/${p.userId}/edit`,
        className: "font-medium text-teal-700 underline",
      },
      "Edit",
    ),
  }));
  return { rows, dbError };
}

export async function getAdminParentForEdit(userId: string): Promise<AdminParentForEdit | null> {
  try {
    const profile = await prisma.parentProfile.findFirst({
      where: { userId },
      include: {
        user: true,
        students: { include: { student: true } },
      },
    });
    if (!profile) return null;

    return {
      userId: profile.userId,
      name: profile.user.name ?? "",
      email: profile.user.email,
      status: profile.user.status,
      billingEmail: profile.billingEmail,
      emergencyContact: profile.emergencyContact,
      notes: profile.notes,
      students: profile.students.map((ps) => ({
        id: ps.student.id,
        displayName: ps.student.displayName,
        isActive: ps.student.isActive,
      })),
    };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return null;
  }
}

export async function getAdminStudentForEdit(studentId: string): Promise<AdminStudentForEdit | null> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: { include: { parent: { include: { user: true } } } },
        assignments: { where: { endsAt: null }, orderBy: { isPrimary: "desc" } },
      },
    });
    if (!student) return null;

    const primary = student.assignments.find((a) => a.isPrimary) ?? student.assignments[0];

    return {
      id: student.id,
      displayName: student.displayName,
      learningLevel: student.learningLevel,
      currentSurah: student.currentSurah,
      currentAyah: student.currentAyah,
      timezone: student.timezone,
      isActive: student.isActive,
      primaryTeacherId: primary?.teacherId ?? null,
      linkedParentProfileId: student.parents[0]?.parentId ?? null,
      parents: student.parents.map((ps) => ({
        profileId: ps.parentId,
        name: ps.parent.user.name ?? ps.parent.user.email,
      })),
    };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return null;
  }
}

export async function getAdminTeacherForEdit(teacherId: string): Promise<AdminTeacherForEdit | null> {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) return null;

    return {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.user.name ?? "",
      email: teacher.user.email,
      status: teacher.user.status,
      headline: teacher.headline,
      bio: teacher.bio,
      timezone: teacher.timezone,
      experienceYears: teacher.experienceYears,
      maxStudents: teacher.maxStudents,
      isAcceptingBookings: teacher.isAcceptingBookings,
    };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return null;
  }
}

export async function getAdminUserFormPickers(): Promise<{
  parents: AdminUserPickerParent[];
  teachers: AdminUserPickerTeacher[];
  dbError: boolean;
}> {
  try {
    const [parentProfiles, teachers] = await Promise.all([
      prisma.parentProfile.findMany({
        orderBy: { user: { name: "asc" } },
        include: { user: true },
      }),
      prisma.teacher.findMany({
        orderBy: { user: { name: "asc" } },
        include: { user: true },
      }),
    ]);

    return {
      parents: parentProfiles.map((p) => ({
        profileId: p.id,
        label: p.user.name ?? p.user.email,
      })),
      teachers: teachers.map((t) => ({
        id: t.id,
        label: t.user.name ?? t.user.email,
      })),
      dbError: false,
    };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { parents: [], teachers: [], dbError: true };
  }
}

export function teacherManageLinks(teacherId: string) {
  return createElement(
    Fragment,
    null,
    createElement(
      Link,
      { href: `/admin/teachers/${teacherId}/edit`, className: "font-medium text-teal-700 underline" },
      "Profile",
    ),
    " · ",
    createElement(
      Link,
      {
        href: `/admin/teachers/${teacherId}/availability`,
        className: "font-medium text-teal-700 underline",
      },
      "Availability",
    ),
  );
}
