export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function formatWeekday(dayOfWeek: number) {
  return WEEKDAY_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`;
}

export function parseMonthParam(value: string | undefined): { year: number; month: number; monthKey: string } {
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const key = value && /^\d{4}-\d{2}$/.test(value) ? value : fallback;
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m, monthKey: key };
}

export function monthNavigation(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const label = new Date(y, m - 1, 1).toLocaleDateString("en-MY", { month: "long", year: "numeric" });
  return { prev, next, label };
}
