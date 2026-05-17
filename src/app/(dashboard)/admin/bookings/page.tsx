import Link from "next/link";
import { BookingStatus, type Prisma } from "@prisma/client";
import { DbBanner } from "@/components/dashboard/db-banner";
import { SectionCard } from "@/components/dashboard/section-card";
import { AdminCancelBookingButton } from "@/components/admin/admin-cancel-booking-button";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/db";

const bookingInclude = {
  student: true,
  teacher: { include: { user: true } },
  packagePurchase: { include: { package: true } },
  pricingRule: true,
} satisfies Prisma.BookingInclude;

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

const filters = [
  { label: "All", value: "" },
  { label: "Pending payment", value: "PENDING_PAYMENT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const valid =
    status != null && status !== "" && Object.values(BookingStatus).includes(status as BookingStatus);
  const where = valid ? { status: status as BookingStatus } : {};

  let dbError = false;
  let bookings: BookingRow[] = [];
  try {
    bookings = await prisma.booking.findMany({
      where,
      orderBy: { scheduledStartAt: "desc" },
      take: 40,
      include: bookingInclude,
    });
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Booking operations" description="Filter, review, and cancel reservations.">
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (status ?? "") === f.value;
            const href = f.value ? `/admin/bookings?status=${encodeURIComponent(f.value)}` : "/admin/bookings";
            return (
              <Link
                key={f.value || "all"}
                href={href}
                className={
                  active
                    ? "rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {bookings.length ? (
          <div className="overflow-hidden rounded-[24px] border border-slate-200/80">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/90">
                <tr>
                  {["Student", "Teacher", "Slot", "Source", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3">{b.student.displayName}</td>
                    <td className="px-4 py-3">{b.teacher.user.name ?? b.teacher.user.email}</td>
                    <td className="px-4 py-3">{formatDateTime(b.scheduledStartAt)}</td>
                    <td className="px-4 py-3">
                      {b.packagePurchase ? b.packagePurchase.package.name : (b.pricingRule?.name ?? "—")}
                    </td>
                    <td className="px-4 py-3">{b.status.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      {b.status !== "CANCELLED" ? <AdminCancelBookingButton bookingId={b.id} /> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No bookings in this filter.</p>
        )}
      </SectionCard>
    </div>
  );
}

