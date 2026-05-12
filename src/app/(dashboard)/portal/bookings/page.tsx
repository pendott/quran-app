import { BookingCalendarPreview } from "@/components/dashboard/booking-calendar-preview";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { portalBookingRows } from "@/lib/dashboard-data";

export default function PortalBookingsPage() {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Calendar booking preview"
        description="Starter calendar layout for teacher availability, package usage, and meeting automation."
      >
        <BookingCalendarPreview />
      </SectionCard>

      <SectionCard
        title="Recommended slots"
        description="Slots that balance teacher availability, package credits, and reminder workflows."
      >
        <DataTable
          columns={["Slot", "Teacher", "Package", "Meeting", "Status"]}
          rows={portalBookingRows}
        />
      </SectionCard>
    </div>
  );
}
