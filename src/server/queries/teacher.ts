import { addDays } from "date-fns";
import Link from "next/link";
import { createElement } from "react";
import { prisma } from "@/lib/db";
import { meetingJoinLinkCell } from "@/components/dashboard/meeting-join-link";
import { formatDateTime } from "@/lib/format";
import { isDatabaseUnavailable, isPrismaQueryError } from "@/server/db-guard";
import type { Stat, TableRow } from "@/lib/types";

export async function getTeacherByUserId(userId: string) {
  try {
    return await prisma.teacher.findUnique({
      where: { userId },
      include: { user: true },
    });
  } catch (error) {
    if (isPrismaQueryError(error)) throw error;
    console.error("getTeacherByUserId", error);
    return null;
  }
}

export async function getTeacherStudentsTable(teacherId: string): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const assignments = await prisma.studentTeacherAssignment.findMany({
      where: { teacherId, endsAt: null },
      include: {
        student: {
          include: {
            classNotes: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { teacher: { include: { user: true } } },
            },
          },
        },
      },
    });

    const rows: TableRow[] = assignments.map((a) => {
      const s = a.student;
      const lastNote = s.classNotes[0];
      return {
        Student: s.displayName,
        LastClass: lastNote ? formatDateTime(lastNote.createdAt) : "—",
        LastSurah: lastNote?.lastSurah ?? s.currentSurah ?? "—",
        Focus: lastNote?.nextTarget ?? "—",
        Homework: lastNote?.homework ?? "—",
      };
    });

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export async function getTeacherClassesTable(teacherId: string): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const sessions = await prisma.classSession.findMany({
      where: { teacherId },
      orderBy: { scheduledStartAt: "asc" },
      take: 30,
      include: {
        student: true,
        meetingLink: true,
        booking: true,
      },
    });

    const rows: TableRow[] = sessions.map((cs) => ({
      Time: formatDateTime(cs.scheduledStartAt),
      Student: cs.student.displayName,
      Topic: cs.booking?.pricingRuleId ? "Scheduled" : "Class",
      "Zoom / join": meetingJoinLinkCell(
        cs.meetingLink?.joinUrl,
        cs.meetingLink?.provider,
        "No link — booking may not be confirmed",
      ),
      Status: cs.status.replace(/_/g, " "),
      Session: createElement(
        Link,
        { href: `/teacher/session/${cs.id}`, className: "font-medium text-teal-700 underline" },
        "Manage",
      ),
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export async function getTeacherTodaySessionsTable(teacherId: string): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = addDays(start, 1);

    const sessions = await prisma.classSession.findMany({
      where: {
        teacherId,
        scheduledStartAt: { gte: start, lt: end },
      },
      orderBy: { scheduledStartAt: "asc" },
      include: {
        student: true,
        meetingLink: true,
        booking: true,
      },
    });

    const rows: TableRow[] = sessions.map((cs) => ({
      Time: formatDateTime(cs.scheduledStartAt),
      Student: cs.student.displayName,
      Topic: cs.booking?.pricingRuleId ? "Scheduled" : "Class",
      "Zoom / join": meetingJoinLinkCell(
        cs.meetingLink?.joinUrl,
        cs.meetingLink?.provider,
        "No link — booking may not be confirmed",
      ),
      Status: cs.status.replace(/_/g, " "),
      Session: createElement(
        Link,
        { href: `/teacher/session/${cs.id}`, className: "font-medium text-teal-700 underline" },
        "Manage",
      ),
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export async function getTeacherDashboardStats(teacherId: string): Promise<{ stats: Stat[]; dbError: boolean }> {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = addDays(start, 1);

    const [todayCount, assigned, sessionsWeek] = await Promise.all([
      prisma.classSession.count({
        where: {
          teacherId,
          scheduledStartAt: { gte: start, lt: end },
        },
      }),
      prisma.studentTeacherAssignment.count({ where: { teacherId, endsAt: null } }),
      prisma.classSession.count({
        where: {
          teacherId,
          scheduledStartAt: { gte: new Date(), lte: addDays(new Date(), 7) },
        },
      }),
    ]);

    const stats: Stat[] = [
      { label: "Today's classes", value: String(todayCount), change: "Sessions starting today (UTC day)", tone: "sky" },
      { label: "Assigned students", value: String(assigned), change: "Active assignments", tone: "emerald" },
      { label: "This week", value: String(sessionsWeek), change: "Upcoming sessions (7d)", tone: "violet" },
      { label: "Attendance", value: "—", change: "Track in class view", tone: "amber" },
    ];

    return { stats, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return {
      stats: [
        { label: "Today's classes", value: "—", change: "DB unavailable", tone: "sky" },
        { label: "Assigned students", value: "—", change: "—", tone: "emerald" },
        { label: "This week", value: "—", change: "—", tone: "violet" },
        { label: "Attendance", value: "—", change: "—", tone: "amber" },
      ],
      dbError: true,
    };
  }
}
