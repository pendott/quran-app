import Link from "next/link";
import { BookingStatus, type Prisma } from "@prisma/client";
import { DbBanner } from "@/components/dashboard/db-banner";
import { SectionCard } from "@/components/dashboard/section-card";
import { AdminCancelBookingButton } from "@/components/admin/admin-cancel-booking-button";
import { AdminCreateBookingForm } from "@/components/admin/admin-create-booking-form";
import { MeetingJoinLink } from "@/components/dashboard/meeting-join-link";
import { getAdminBookingFormOptions } from "@/server/queries/admin-booking";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/db";

const bookingInclude = {
  student: true,
  teacher: { include: { user: true } },
  packagePurchase: { include: { package: true } },
  pricingRule: true,
  classSession: { include: { meetingLink: true } },
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
  const { students, teachers, dbError: pickerError } = await getAdminBookingFormOptions();
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
      <SectionCard title="Add booking manually" description="Schedule a class for any student and teacher. Confirmed bookings create a class session and reminders.">
        {pickerError ? (
          <p className="text-sm text-slate-500">Could not load students or teachers.</p>
        ) : (
          <AdminCreateBookingForm students={students} teachers={teachers} />
        )}
      </SectionCard>

      <SectionCard title="Booking operations" description="Filter, review, edit, and cancel reservations.">
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
                  {["Student", "Teacher", "Slot", "Source", "Zoom / join", "Status", "Actions"].map((h) => (
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
                    <td className="px-4 py-3">
                      <MeetingJoinLink
                        joinUrl={b.classSession?.meetingLink?.joinUrl}
                        provider={b.classSession?.meetingLink?.provider}
                        pendingReason={
                          b.status === "PENDING_PAYMENT"
                            ? "After payment / confirm"
                            : b.status === "CANCELLED"
                              ? "Cancelled"
                              : "Confirm booking to generate Zoom link"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">{b.status.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/bookings/${b.id}/edit`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        {b.status !== "CANCELLED" ? <AdminCancelBookingButton bookingId={b.id} /> : null}
                      </div>
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

