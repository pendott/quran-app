import { prisma } from "@/lib/db";
import { formatDateTime, formatMYR } from "@/lib/format";
import { isDatabaseUnavailable } from "@/server/db-guard";
import type { Stat, TableRow, TimelineItem, UserRole } from "@/lib/types";

export async function getFamilyStudentIds(userId: string, role: UserRole): Promise<string[]> {
  if (role === "STUDENT") {
    const s = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
    return s ? [s.id] : [];
  }
  if (role === "PARENT") {
    const profile = await prisma.parentProfile.findUnique({
      where: { userId },
      include: { students: { select: { studentId: true } } },
    });
    return profile?.students.map((x) => x.studentId) ?? [];
  }
  return [];
}

export async function getFamilyDashboard(
  userId: string,
  role: UserRole,
): Promise<{
  stats: Stat[];
  timeline: TimelineItem[];
  recordingRows: TableRow[];
  dbError: boolean;
}> {
  try {
    const ids = await getFamilyStudentIds(userId, role);
    if (ids.length === 0) {
      return {
        stats: [
          { label: "Next class", value: "—", change: "No linked student", tone: "sky" },
          { label: "Package balance", value: "—", change: "—", tone: "emerald" },
          { label: "Completed sessions", value: "0", change: "—", tone: "violet" },
          { label: "Unread notes", value: "0", change: "—", tone: "amber" },
        ],
        timeline: [],
        recordingRows: [],
        dbError: false,
      };
    }

    const nextBooking = await prisma.booking.findFirst({
      where: {
        studentId: { in: ids },
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
        scheduledStartAt: { gte: new Date() },
      },
      orderBy: { scheduledStartAt: "asc" },
      include: { teacher: { include: { user: true } } },
    });

    const purchases = await prisma.packagePurchase.findMany({
      where: { studentId: { in: ids }, status: "ACTIVE" },
    });
    let totalCredits = 0;
    let remaining = 0;
    let usedSum = 0;
    for (const p of purchases) {
      const tot = p.totalCredits ?? 0;
      totalCredits += tot;
      usedSum += p.usedCredits;
      remaining += Math.max(0, tot - p.usedCredits);
    }

    const completed = await prisma.classSession.count({
      where: { studentId: { in: ids }, status: "COMPLETED" },
    });

    const notesCount = await prisma.classNote.count({
      where: { studentId: { in: ids }, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    });

    const stats: Stat[] = [
      {
        label: "Next class",
        value: nextBooking ? formatDateTime(nextBooking.scheduledStartAt) : "None scheduled",
        change: nextBooking ? (nextBooking.teacher.user.name ?? "Teacher") : "Book a slot",
        tone: "sky",
      },
      {
        label: "Package balance",
        value: purchases.length ? `${remaining} credits` : "No package",
        change: purchases.length ? `Used ${usedSum} of ${totalCredits} total` : "Purchase a package",
        tone: "emerald",
      },
      {
        label: "Completed sessions",
        value: String(completed),
        change: "All time",
        tone: "violet",
      },
      {
        label: "Recent notes",
        value: String(notesCount),
        change: "Last 7 days",
        tone: "amber",
      },
    ];

    const notes = await prisma.classNote.findMany({
      where: { studentId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { teacher: { include: { user: true } }, student: true },
    });

    const timeline: TimelineItem[] = notes.map((n) => ({
      title: `${n.lastSurah ?? "Lesson"} ${n.lastAyahFrom ? `· ${n.lastAyahFrom}` : ""}`.trim() || "Class note",
      description: n.summary ?? n.homework ?? n.nextTarget ?? "—",
      meta: `${formatDateTime(n.createdAt)} · ${n.teacher.user.name ?? "Teacher"}`,
    }));

    const recordings = await prisma.recording.findMany({
      where: { classSession: { studentId: { in: ids } }, visibleToFamily: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { classSession: { include: { teacher: { include: { user: true } } } } },
    });

    const recordingRows: TableRow[] = recordings.map((r) => ({
      Date: formatDateTime(r.createdAt),
      Session: r.title,
      Teacher: r.classSession.teacher.user.name ?? "—",
      Access: r.status.replace(/_/g, " "),
      Notes: r.playbackUrl ? "Link" : "—",
    }));

    return { stats, timeline, recordingRows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return {
      stats: [
        { label: "Next class", value: "—", change: "DB error", tone: "sky" },
        { label: "Package balance", value: "—", change: "—", tone: "emerald" },
        { label: "Completed sessions", value: "—", change: "—", tone: "violet" },
        { label: "Recent notes", value: "—", change: "—", tone: "amber" },
      ],
      timeline: [],
      recordingRows: [],
      dbError: true,
    };
  }
}

export async function getFamilyBookingsTable(userId: string, role: UserRole): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const ids = await getFamilyStudentIds(userId, role);
    if (!ids.length) return { rows: [], dbError: false };

    const bookings = await prisma.booking.findMany({
      where: { studentId: { in: ids } },
      orderBy: { scheduledStartAt: "desc" },
      take: 20,
      include: {
        teacher: { include: { user: true } },
        packagePurchase: { include: { package: true } },
        pricingRule: true,
      },
    });

    const rows: TableRow[] = bookings.map((b) => ({
      Slot: formatDateTime(b.scheduledStartAt),
      Teacher: b.teacher.user.name ?? b.teacher.user.email,
      Package: b.packagePurchase ? b.packagePurchase.package.name : (b.pricingRule?.name ?? "—"),
      Meeting: b.status === "CONFIRMED" ? "Scheduled" : b.status.replace(/_/g, " "),
      Status: b.status.replace(/_/g, " "),
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export async function getFamilyPaymentsTable(userId: string, role: UserRole): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const ids = await getFamilyStudentIds(userId, role);
    if (!ids.length) return { rows: [], dbError: false };

    const payments = await prisma.payment.findMany({
      where: { studentId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { packagePurchase: { include: { package: true } } },
    });

    const rows: TableRow[] = payments.map((p) => ({
      Date: formatDateTime(p.createdAt),
      Item: p.packagePurchase ? p.packagePurchase.package.name : "Class payment",
      Amount: formatMYR(p.amount),
      Method: p.provider,
      Status: p.status,
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export type FamilyStudentOption = { id: string; displayName: string };

export async function listStudentsForFamilyPicker(
  userId: string,
  role: UserRole,
): Promise<FamilyStudentOption[]> {
  const ids = await getFamilyStudentIds(userId, role);
  if (!ids.length) return [];
  const students = await prisma.student.findMany({
    where: { id: { in: ids } },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
  return students;
}

export type TeacherOption = { id: string; name: string };

export async function listTeachersForBooking(): Promise<TeacherOption[]> {
  const teachers = await prisma.teacher.findMany({
    where: { isAcceptingBookings: true },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });
  return teachers.map((t) => ({
    id: t.id,
    name: t.user.name ?? t.user.email,
  }));
}
