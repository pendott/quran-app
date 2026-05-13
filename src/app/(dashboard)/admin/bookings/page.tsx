import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminBookingsTable } from "@/server/queries/admin";

export default async function AdminBookingsPage() {
  const { rows, dbError } = await getAdminBookingsTable();

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard
        title="Booking operations"
        description="Commercial reservation state, package consumption, and reschedule tracking."
      >
        {rows.length ? (
          <DataTable columns={["Booking", "Student", "Teacher", "Slot", "Source", "Status"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No bookings yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
