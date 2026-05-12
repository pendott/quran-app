import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { bookingRows } from "@/lib/dashboard-data";

export default function AdminBookingsPage() {
  return (
    <SectionCard
      title="Booking operations"
      description="Commercial reservation state, package consumption, and reschedule tracking."
    >
      <DataTable
        columns={["Booking", "Student", "Teacher", "Slot", "Source", "Status"]}
        rows={bookingRows}
      />
    </SectionCard>
  );
}
