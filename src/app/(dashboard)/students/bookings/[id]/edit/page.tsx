import Link from "next/link";
import { notFound } from "next/navigation";
import { FamilyCancelBookingButton } from "@/components/booking/family-cancel-booking-button";
import { FamilyEditBookingForm } from "@/components/booking/family-edit-booking-form";
import { MeetingJoinLink } from "@/components/dashboard/meeting-join-link";
import { SectionCard } from "@/components/dashboard/section-card";
import { requireRole } from "@/lib/rbac";
import { formatDateTime } from "@/lib/format";
import {
  getActiveCancellationRule,
  readBookingMetadata,
} from "@/server/booking/cancellation-policy";
import { getFamilyBookingManageContext } from "@/server/queries/family-booking";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function FamilyEditBookingPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRole(["STUDENT", "PARENT"]);
  const context = await getFamilyBookingManageContext(session.user.id!, session.user.role!, id);
  if (!context) notFound();

  const rule = await getActiveCancellationRule();
  const meta = readBookingMetadata(context.booking.metadata);
  const teacherName = context.booking.teacher.user.name ?? context.booking.teacher.user.email;

  const canCancel =
    context.booking.scheduledStartAt > new Date() &&
    context.booking.status !== "CANCELLED" &&
    context.booking.status !== "COMPLETED";

  return (
    <div className="space-y-4">
      <Link href="/students/bookings" className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to bookings
      </Link>

      <SectionCard
        title="Manage booking"
        description={`${context.booking.student.displayName} with ${teacherName} · ${formatDateTime(context.booking.scheduledStartAt)}`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {context.booking.status.replace(/_/g, " ")}
          </span>
          {canCancel ? <FamilyCancelBookingButton bookingId={context.booking.id} /> : null}
        </div>

        <MeetingJoinLink
          joinUrl={context.booking.classSession?.meetingLink?.joinUrl}
          provider={context.booking.classSession?.meetingLink?.provider}
          pendingReason={
            context.booking.status === "CONFIRMED" || context.booking.status === "RESCHEDULED"
              ? "No link yet — it will appear after confirmation"
              : "Confirm booking first"
          }
        />
      </SectionCard>

      <SectionCard title="Reschedule" description="Pick a new teacher and open slot.">
        <FamilyEditBookingForm
          booking={{
            id: context.booking.id,
            studentName: context.booking.student.displayName,
            teacherId: context.booking.teacherId,
            scheduledStartAt: context.booking.scheduledStartAt,
            status: context.booking.status,
            durationMinutes: context.booking.durationMinutes,
            rescheduleCount: meta.rescheduleCount ?? 0,
            maxReschedules: rule?.maxReschedules ?? 1,
            noticeHours: rule?.noticeHours ?? 24,
          }}
          teachers={context.teachers}
        />
      </SectionCard>
    </div>
  );
}
