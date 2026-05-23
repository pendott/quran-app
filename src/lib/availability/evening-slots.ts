/** 60-minute class blocks with a 15-minute gap before the next start. */

export type EveningSlotTemplate = {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
};

function minutesFromTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function timeFromMinutes(total: number) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function format12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const hour = h ?? 0;
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

/**
 * Full-day slots: 8:00 AM – 9:00 AM, 9:15 AM – 10:15 AM, … 9:45 PM – 10:45 PM
 * (60-minute class, 15-minute break between slots).
 */
export function buildEveningSlotTemplates(options?: {
  firstStartTime?: string;
  lastEndTime?: string;
  durationMinutes?: number;
  gapMinutes?: number;
}): EveningSlotTemplate[] {
  const firstStartTime = options?.firstStartTime ?? "08:00";
  const lastEndTime = options?.lastEndTime ?? "22:45";
  const durationMinutes = options?.durationMinutes ?? 60;
  const gapMinutes = options?.gapMinutes ?? 15;

  const lastEnd = minutesFromTime(lastEndTime);
  let start = minutesFromTime(firstStartTime);
  const slots: EveningSlotTemplate[] = [];

  while (start + durationMinutes <= lastEnd) {
    const end = start + durationMinutes;
    const startTime = timeFromMinutes(start);
    const endTime = timeFromMinutes(end);
    slots.push({
      id: `${startTime}-${endTime}`,
      startTime,
      endTime,
      label: `${format12h(startTime)} – ${format12h(endTime)}`,
    });
    start = end + gapMinutes;
  }

  return slots;
}

export const EVENING_BOOKING_SLOTS = buildEveningSlotTemplates();

/** Pre-select after-school / evening slots on weekdays (6:00 PM onwards). */
export const DEFAULT_WEEKDAY_EVENING_SLOT_IDS = EVENING_BOOKING_SLOTS.filter(
  (s) => minutesFromTime(s.startTime) >= 18 * 60,
).map((s) => s.id);

export function slotKey(dayOfWeek: number, startTime: string, endTime: string) {
  return `${dayOfWeek}:${startTime}-${endTime}`;
}

export function parseSlotKey(key: string) {
  const [dayStr, times] = key.split(":");
  const [startTime, endTime] = times.split("-");
  return { dayOfWeek: Number(dayStr), startTime, endTime };
}
