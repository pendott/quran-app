export function formatMYR(amount: unknown): string {
  if (amount == null) return "RM 0.00";
  const n = Number(String(amount));
  if (Number.isNaN(n)) return "RM 0.00";
  return `RM ${n.toFixed(2)}`;
}

export function formatDateTime(iso: Date): string {
  return iso.toLocaleString("en-MY", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuala_Lumpur",
  });
}
