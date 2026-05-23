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
  const suffix = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(m ?? 0).padStart(2, "0")}${suffix}`;
}

/**
 * Evening slots from 8:00 pm in the pattern 8–9, 9:15–10:15, 10:30–11:30, …
 * Stops when the next slot would end after `lastEndTime` (default 11:30 pm).
 */
export function buildEveningSlotTemplates(options?: {
  firstStartTime?: string;
  lastEndTime?: string;
  durationMinutes?: number;
  gapMinutes?: number;
}): EveningSlotTemplate[] {
  const firstStartTime = options?.firstStartTime ?? "20:00";
  /** Last class ends at 11:30 pm (10:30–11:30 slot). */
  /** No class may end after this time (default 11:00 pm). */
  const lastEndTime = options?.lastEndTime ?? "23:00";
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

  // Pattern may land at 10:30–11:30 pm; when capping at 11 pm, offer 10:00–11:00 pm instead.
  const hasTenToEleven = slots.some((s) => s.startTime === "22:00" && s.endTime === "23:00");
  if (!hasTenToEleven && lastEnd >= minutesFromTime("23:00")) {
    slots.push({
      id: "22:00-23:00",
      startTime: "22:00",
      endTime: "23:00",
      label: `${format12h("22:00")} – ${format12h("23:00")}`,
    });
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export const EVENING_BOOKING_SLOTS = buildEveningSlotTemplates();

export const DEFAULT_WEEKDAY_EVENING_SLOT_IDS = EVENING_BOOKING_SLOTS.map((s) => s.id);

export function slotKey(dayOfWeek: number, startTime: string, endTime: string) {
  return `${dayOfWeek}:${startTime}-${endTime}`;
}

export function parseSlotKey(key: string) {
  const [dayStr, times] = key.split(":");
  const [startTime, endTime] = times.split("-");
  return { dayOfWeek: Number(dayStr), startTime, endTime };
}
