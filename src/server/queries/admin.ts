import { BookingStatus } from "@prisma/client";
import { addDays } from "date-fns";
import Link from "next/link";
import { createElement } from "react";
import { meetingJoinLinkCell } from "@/components/dashboard/meeting-join-link";
import { teacherManageLinks } from "@/server/queries/admin-users";
import { prisma } from "@/lib/db";
import { formatDateTime, formatMYR } from "@/lib/format";
import { isDatabaseUnavailable } from "@/server/db-guard";
import type { Stat, TableRow } from "@/lib/types";

export type AdminDashboardData = {
  stats: Stat[];
  upcomingRows: TableRow[];
  pendingPaymentRows: TableRow[];
  dbError: boolean;
};

const emptyStats: Stat[] = [
  { label: "Total students", value: "—", change: "Connect database", tone: "emerald" },
  { label: "Total teachers", value: "—", change: "Connect database", tone: "sky" },
  { label: "Revenue (paid)", value: "—", change: "Connect database", tone: "violet" },
  { label: "Pending payments", value: "—", change: "Connect database", tone: "amber" },
];

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    const now = new Date();
    const horizon = addDays(now, 2);

    const [studentCount, teacherCount, revenueAgg, pendingCount, upcoming, pendingPayments] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count(),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
          scheduledStartAt: { gte: now, lte: horizon },
        },
        orderBy: { scheduledStartAt: "asc" },
        take: 12,
        include: {
          student: true,
          teacher: { include: { user: true } },
          pricingRule: true,
          packagePurchase: { include: { package: true } },
          classSession: { include: { meetingLink: true } },
        },
      }),
      prisma.payment.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { student: true },
      }),
    ]);

    const stats: Stat[] = [
      {
        label: "Total students",
        value: String(studentCount),
        change: "Active learners in roster",
        tone: "emerald",
      },
      {
        label: "Total teachers",
        value: String(teacherCount),
        change: "Teacher profiles",
        tone: "sky",
      },
      {
        label: "Revenue (paid)",
        value: formatMYR(revenueAgg._sum.amount),
        change: "All-time settled payments",
        tone: "violet",
      },
      {
        label: "Pending payments",
        value: String(pendingCount),
        change: "Awaiting confirmation",
        tone: "amber",
      },
    ];

    const upcomingRows: TableRow[] = upcoming.map((b) => {
      const link = b.classSession?.meetingLink;
      return {
        Student: b.student.displayName,
        Teacher: b.teacher.user.name ?? b.teacher.user.email,
        Time: formatDateTime(b.scheduledStartAt),
        Plan: b.packagePurchase ? b.packagePurchase.package.name : (b.pricingRule?.name ?? "—"),
        "Zoom / join": meetingJoinLinkCell(
          link?.joinUrl,
          link?.provider,
          b.status === "PENDING_PAYMENT" ? "After payment / confirm" : "No link yet",
        ),
        Status: b.status.replace(/_/g, " "),
      };
    });

    const pendingPaymentRows: TableRow[] = pendingPayments.map((p) => ({
      Invoice: p.id.slice(0, 8).toUpperCase(),
      Student: p.student.displayName,
      Amount: formatMYR(p.amount),
      Method: p.provider,
      Status: p.status,
    }));

    return { stats, upcomingRows, pendingPaymentRows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { stats: emptyStats, upcomingRows: [], pendingPaymentRows: [], dbError: true };
  }
}

export async function getAdminStudentRoster(): Promise<{
  rows: TableRow[];
  stats: Stat[];
  dbError: boolean;
}> {
  try {
    const students = await prisma.student.findMany({
      orderBy: { displayName: "asc" },
      include: {
        parents: { include: { parent: { include: { user: true } } } },
        assignments: {
          where: { endsAt: null },
          include: { teacher: { include: { user: true } } },
        },
      },
    });

    const parentLinked = await prisma.parentStudent.count();
    const bookingsWeek = await prisma.booking.count({
      where: {
        scheduledStartAt: { gte: new Date(), lte: addDays(new Date(), 7) },
        status: { not: "CANCELLED" },
      },
    });

    const stats: Stat[] = [
      {
        label: "Active students",
        value: String(await prisma.student.count({ where: { isActive: true } })),
        change: "In roster",
        tone: "emerald",
      },
      {
        label: "Linked parents",
        value: String(parentLinked),
        change: "Parent-student links",
        tone: "sky",
      },
      {
        label: "Upcoming bookings",
        value: String(bookingsWeek),
        change: "Next 7 days",
        tone: "amber",
      },
    ];

    const rows: TableRow[] = students.map((s) => {
      const parentNames = s.parents.map((ps) => ps.parent.user.name ?? ps.parent.user.email).join(", ") || "—";
      const teacher =
        s.assignments[0]?.teacher.user.name ?? s.assignments[0]?.teacher.user.email ?? "—";
      const progress =
        s.currentSurah || s.currentAyah ? `${s.currentSurah ?? ""} ${s.currentAyah ?? ""}`.trim() : "—";
      return {
        Student: s.displayName,
        Parent: parentNames,
        Teacher: teacher,
        Progress: progress,
        Status: s.isActive ? "Active" : "Inactive",
        Manage: createElement(
          Link,
          {
            href: `/admin/students/${s.id}/edit`,
            className: "font-medium text-teal-700 underline",
          },
          "Edit",
        ),
      };
    });

    return { rows, stats, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return {
      rows: [],
      stats: [
        { label: "Active students", value: "—", change: "DB unavailable", tone: "emerald" },
        { label: "Linked parents", value: "—", change: "DB unavailable", tone: "sky" },
        { label: "Upcoming bookings", value: "—", change: "DB unavailable", tone: "amber" },
      ],
      dbError: true,
    };
  }
}

export async function getAdminTeachersDirectory(): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
        assignments: { where: { endsAt: null } },
        availabilities: { where: { isActive: true } },
      },
    });

    const rows: TableRow[] = teachers.map((t) => ({
      Teacher: t.user.name ?? t.user.email,
      Specialty: t.headline ?? t.bio?.slice(0, 48) ?? "—",
      Timezone: t.timezone,
      Students: String(t.assignments.length),
      Availability: t.availabilities.length ? `${t.availabilities.length} rule(s)` : "Not set",
      Manage: teacherManageLinks(t.id),
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export async function getAdminBookingsTable(
  statusFilter?: string | null,
): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const valid =
      statusFilter != null && statusFilter !== "" && Object.values(BookingStatus).includes(statusFilter as BookingStatus);
    const where = valid ? { status: statusFilter as BookingStatus } : {};

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { scheduledStartAt: "desc" },
      take: 40,
      include: {
        student: true,
        teacher: { include: { user: true } },
        packagePurchase: { include: { package: true } },
        pricingRule: true,
      },
    });

    const rows: TableRow[] = bookings.map((b) => ({
      Booking: b.id.slice(0, 8).toUpperCase(),
      Student: b.student.displayName,
      Teacher: b.teacher.user.name ?? b.teacher.user.email,
      Slot: formatDateTime(b.scheduledStartAt),
      Source: b.packagePurchase ? b.packagePurchase.package.name : (b.pricingRule?.name ?? "—"),
      Status: b.status.replace(/_/g, " "),
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}

export async function getAdminPaymentsTable(): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { student: true, booking: true, packagePurchase: { include: { package: true } } },
    });

    const rows: TableRow[] = payments.map((p) => ({
      Payment: p.id.slice(0, 8).toUpperCase(),
      Student: p.student.displayName,
      Amount: formatMYR(p.amount),
      Gateway: p.provider,
      Purpose: p.bookingId
        ? `Booking ${p.bookingId.slice(0, 6)}`
        : p.packagePurchase
          ? p.packagePurchase.package.name
          : "—",
      Status: p.status,
    }));

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}
