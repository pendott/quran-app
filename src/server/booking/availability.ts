import { addDays, addMinutes, setHours, setMinutes, startOfDay } from "date-fns";
import { prisma } from "@/lib/db";

function parseTime(hhmm: string): { hours: number; minutes: number } {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  return { hours: h || 0, minutes: m || 0 };
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Expands recurring weekly availability into concrete slots, minus teacher bookings.
 */
export async function getAvailableSlots(
  teacherId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<{ start: Date; end: Date }[]> {
  const rules = await prisma.teacherAvailability.findMany({
    where: { teacherId, isActive: true, type: "RECURRING" },
  });

  const busy = await prisma.booking.findMany({
    where: {
      teacherId,
      status: { notIn: ["CANCELLED"] },
      scheduledStartAt: { lt: rangeEnd },
      scheduledEndAt: { gt: rangeStart },
    },
    select: { scheduledStartAt: true, scheduledEndAt: true },
  });

  const exceptions = await prisma.teacherAvailability.findMany({
    where: {
      teacherId,
      isActive: true,
      type: "EXCEPTION",
      specificDate: { gte: rangeStart, lt: rangeEnd },
    },
  });

  const slots: { start: Date; end: Date }[] = [];

  function pushSlotsForDay(day: Date, rule: { startTime: string; endTime: string; slotDurationMinutes: number }) {
    const { hours: sh, minutes: sm } = parseTime(rule.startTime);
    const { hours: eh, minutes: em } = parseTime(rule.endTime);
    let slotStart = setMinutes(setHours(new Date(day), sh), sm);
    const dayEnd = setMinutes(setHours(new Date(day), eh), em);

    while (addMinutes(slotStart, rule.slotDurationMinutes) <= dayEnd) {
      const slotEnd = addMinutes(slotStart, rule.slotDurationMinutes);
      const taken = busy.some((b) => overlaps(slotStart, slotEnd, b.scheduledStartAt, b.scheduledEndAt));
      if (!taken && slotStart >= rangeStart && slotEnd <= rangeEnd) {
        slots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
      }
      slotStart = slotEnd;
    }
  }

  for (let day = new Date(rangeStart); day < rangeEnd; day = addDays(day, 1)) {
    const dow = day.getDay();
    for (const rule of rules) {
      if (rule.dayOfWeek == null || rule.dayOfWeek !== dow) continue;
      pushSlotsForDay(day, rule);
    }
  }

  for (const rule of exceptions) {
    if (!rule.specificDate) continue;
    const day = startOfDay(rule.specificDate);
    if (day < rangeStart || day >= rangeEnd) continue;
    pushSlotsForDay(day, rule);
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}
