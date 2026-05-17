/** Format for `<input type="datetime-local" />` in local time. */
export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDatetimeLocal(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
