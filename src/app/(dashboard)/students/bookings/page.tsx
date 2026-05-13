import { auth } from "@/auth";
import { FamilyBookingForm } from "@/components/booking/family-booking-form";
import { BookingCalendarPreview } from "@/components/dashboard/booking-calendar-preview";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getFamilyBookingsTable, listStudentsForFamilyPicker, listTeachersForBooking } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

export default async function StudentsBookingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role as UserRole | undefined;
  if (!userId || !role) return null;

  const [{ rows, dbError }, teachers, students] = await Promise.all([
    getFamilyBookingsTable(userId, role),
    listTeachersForBooking(),
    listStudentsForFamilyPicker(userId, role),
  ]);

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Book a class" description="Choose a student, teacher, and open slot. Package credits skip payment.">
        <FamilyBookingForm teachers={teachers} students={students} />
      </SectionCard>

      <SectionCard title="Your bookings" description="Recent and upcoming reservations.">
        {rows.length ? (
          <DataTable columns={["Slot", "Teacher", "Package", "Meeting", "Status"]} rows={rows} />
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
