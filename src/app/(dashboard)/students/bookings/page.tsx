import { auth } from "@/auth";
import { FamilyBookingForm } from "@/components/booking/family-booking-form";
import { BookingCalendarPreview } from "@/components/dashboard/booking-calendar-preview";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { PaymentSuccessBanner } from "@/components/payments/payment-success-banner";
import { isBillplzEnabled } from "@/lib/payments/provider";
import { getFamilyBookingsTable, listStudentsForFamilyPicker, listTeachersForBooking } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

type Props = { searchParams: Promise<{ paid?: string }> };

export default async function StudentsBookingsPage({ searchParams }: Props) {
  const { paid } = await searchParams;
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
          <DataTable columns={["Slot", "Teacher", "Package", "Zoom / join", "Status"]} rows={rows} />
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
