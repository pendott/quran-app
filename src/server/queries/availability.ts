import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { parseMonthParam } from "@/lib/availability/constants";

export async function getTeacherAvailabilityBundle(teacherId: string, monthParam?: string) {
  const { monthKey } = parseMonthParam(monthParam);
  const [y, m] = monthKey.split("-").map(Number);
  const rangeStart = startOfMonth(new Date(y, m - 1, 1));
  const rangeEnd = endOfMonth(rangeStart);

  const [teacher, recurring, exceptions] = await Promise.all([
    prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.teacherAvailability.findMany({
      where: { teacherId, type: "RECURRING", isActive: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        type: "EXCEPTION",
        isActive: true,
        specificDate: { gte: rangeStart, lte: rangeEnd },
      },
      orderBy: [{ specificDate: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return {
    teacher,
    monthKey,
    recurring: recurring.map((r) => ({
      id: r.id,
      dayOfWeek: r.dayOfWeek ?? 0,
      startTime: r.startTime,
      endTime: r.endTime,
      slotDurationMinutes: r.slotDurationMinutes,
    })),
    exceptions: exceptions.map((e) => ({
      id: e.id,
      specificDate: e.specificDate!.toISOString().slice(0, 10),
      startTime: e.startTime,
      endTime: e.endTime,
      slotDurationMinutes: e.slotDurationMinutes,
    })),
  };
}

export async function listTeachersForAvailabilityAdmin() {
  return prisma.teacher.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { user: { name: "asc" } },
  });
}
