import type { Booking, CancellationRule } from "@prisma/client";
import { prisma } from "@/lib/db";

export type BookingMetadata = {
  rescheduleCount?: number;
};

export function readBookingMetadata(metadata: unknown): BookingMetadata {
  if (!metadata || typeof metadata !== "object") return {};
  const m = metadata as BookingMetadata;
  return { rescheduleCount: typeof m.rescheduleCount === "number" ? m.rescheduleCount : 0 };
}

export async function getActiveCancellationRule(): Promise<CancellationRule | null> {
  return prisma.cancellationRule.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export function assertBookingIsFuture(booking: Pick<Booking, "scheduledStartAt" | "status">) {
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return { ok: false as const, error: "This booking can no longer be changed" };
  }
  if (booking.scheduledStartAt.getTime() <= Date.now()) {
    return { ok: false as const, error: "Past bookings cannot be changed" };
  }
  return { ok: true as const };
}

export function assertNoticePeriod(
  booking: Pick<Booking, "scheduledStartAt">,
  rule: CancellationRule | null,
) {
  const noticeHours = rule?.noticeHours ?? 24;
  const cutoff = booking.scheduledStartAt.getTime() - noticeHours * 60 * 60 * 1000;
  if (Date.now() > cutoff) {
    return {
      ok: false as const,
      error: `Changes must be made at least ${noticeHours} hours before class`,
    };
  }
  return { ok: true as const };
}

export function assertCanReschedule(
  booking: Pick<Booking, "metadata">,
  rule: CancellationRule | null,
) {
  if (rule && !rule.allowReschedule) {
    return { ok: false as const, error: "Rescheduling is not allowed for this booking" };
  }
  const count = readBookingMetadata(booking.metadata).rescheduleCount ?? 0;
  const max = rule?.maxReschedules ?? 1;
  if (count >= max) {
    return { ok: false as const, error: `Reschedule limit reached (${max})` };
  }
  return { ok: true as const };
}
