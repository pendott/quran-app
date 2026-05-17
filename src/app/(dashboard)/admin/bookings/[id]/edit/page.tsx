import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEditBookingForm } from "@/components/admin/admin-edit-booking-form";
import { MeetingJoinLink } from "@/components/dashboard/meeting-join-link";
import { SectionCard } from "@/components/dashboard/section-card";
import { formatDateTime } from "@/lib/format";
import { getAdminBookingForEdit, getAdminBookingFormOptions } from "@/server/queries/admin-booking";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function AdminEditBookingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;

  const [booking, { students, teachers, dbError }] = await Promise.all([
    getAdminBookingForEdit(id),
    getAdminBookingFormOptions(),
  ]);

  if (!booking) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/bookings"
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          ← Back to bookings
        </Link>
      </div>

      {created === "1" ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Booking created. You can adjust details below.
        </p>
      ) : null}

      <SectionCard title="Zoom meeting link" description="Generated when booking is confirmed and Zoom is configured.">
        <MeetingJoinLink
          joinUrl={booking.classSession?.meetingLink?.joinUrl}
          provider={booking.classSession?.meetingLink?.provider}
          pendingReason={
            booking.status === "CONFIRMED"
              ? "No link yet — save as confirmed again or check Zoom env / logs"
              : "Set status to Confirmed to create a Zoom link"
          }
        />
        {booking.classSession?.meetingLink?.joinUrl ? (
          <p className="mt-2 break-all font-mono text-[11px] text-slate-500">
            {booking.classSession.meetingLink.joinUrl}
          </p>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Edit booking"
        description={`${booking.student.displayName} with ${booking.teacher.user.name ?? booking.teacher.user.email} · ${formatDateTime(booking.scheduledStartAt)}`}
      >
        {dbError ? (
          <p className="text-sm text-red-600">Could not load form options.</p>
        ) : (
          <AdminEditBookingForm
            booking={{
              id: booking.id,
              studentId: booking.studentId,
              teacherId: booking.teacherId,
              status: booking.status,
              scheduledStartAt: booking.scheduledStartAt,
              durationMinutes: booking.durationMinutes,
              cancellationReason: booking.cancellationReason,
            }}
            students={students}
            teachers={teachers}
          />
        )}
      </SectionCard>

      {booking.packagePurchase ? (
        <p className="text-sm text-slate-600">
          Package: <strong>{booking.packagePurchase.package.name}</strong> (credits linked — change student/time carefully)
        </p>
      ) : null}
    </div>
  );
}
