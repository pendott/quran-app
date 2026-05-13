import { BookingCalendarPreview } from "@/components/dashboard/booking-calendar-preview";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { studentBookingRows } from "@/lib/dashboard-data";

export default function StudentsBookingsPage() {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Book a class"
        description="Pick a slot that matches teacher availability. Payment or package credit applies when you confirm."
      >
        <BookingCalendarPreview />
      </SectionCard>

      <SectionCard
        title="Recommended slots"
        description="These suggestions balance your package credits, teacher load, and reminder timing."
      >
        <DataTable
          columns={["Slot", "Teacher", "Package", "Meeting", "Status"]}
          rows={studentBookingRows}
        />
      </SectionCard>
    </div>
  );
}
