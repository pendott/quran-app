import Link from "next/link";
import { auth } from "@/auth";
import { FamilyBookingForm } from "@/components/booking/family-booking-form";
import { FamilyCancelBookingButton } from "@/components/booking/family-cancel-booking-button";
import { BookingCalendarPreview } from "@/components/dashboard/booking-calendar-preview";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { PaymentSuccessBanner } from "@/components/payments/payment-success-banner";
import { isBillplzEnabled } from "@/lib/payments/provider";
import { getFamilyBookingsTable, listStudentsForFamilyPicker, listTeachersForBooking } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

type Props = { searchParams: Promise<{ paid?: string; updated?: string }> };

export default async function StudentsBookingsPage({ searchParams }: Props) {
  const { paid, updated } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role as UserRole | undefined;
  if (!userId || !role) return null;

  const [{ rows, dbError }, teachers, students] = await Promise.all([
    getFamilyBookingsTable(userId, role),
    listTeachersForBooking(),
    listStudentsForFamilyPicker(userId, role),
  ]);

  const billplzEnabled = isBillplzEnabled();

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <PaymentSuccessBanner
        show={paid === "1"}
        message="Payment received. Your class should appear as confirmed once the gateway callback completes."
      />
      {updated === "1" ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Booking updated. Your new class time is saved.
        </p>
      ) : null}
      <SectionCard
        title="Book a class"
        description={
          billplzEnabled
            ? "Choose a student, teacher, and open slot. Package credits skip payment; otherwise you pay via Billplz FPX."
            : "Choose a student, teacher, and open slot. Package credits skip payment; otherwise complete mock checkout."
        }
      >
        <FamilyBookingForm teachers={teachers} students={students} billplzEnabled={billplzEnabled} />
      </SectionCard>

      <SectionCard title="Your bookings" description="Recent and upcoming reservations.">
        {rows.length ? (
          <DataTable
            columns={["Slot", "Teacher", "Package", "Zoom / join", "Status", "Actions"]}
            rows={rows.map((r) => ({
              Slot: r.slot,
              Teacher: r.teacher,
              Package: r.package,
              "Zoom / join": r.zoomJoin,
              Status: r.status,
              Actions: r.canManage ? (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/students/bookings/${r.id}/edit`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <FamilyCancelBookingButton bookingId={r.id} />
                </div>
              ) : (
                "—"
              ),
            }))}
          />
        ) : (
          <p className="text-sm text-slate-500">No bookings yet.</p>
        )}
      </SectionCard>

      <SectionCard title="Calendar preview" description="Static week pattern reference.">
        <BookingCalendarPreview />
      </SectionCard>
    </div>
  );
}
