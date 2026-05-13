import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminTeachersDirectory } from "@/server/queries/admin";

export default async function AdminTeachersPage() {
  const { rows, dbError } = await getAdminTeachersDirectory();

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard
        title="Teacher management"
        description="Teacher directory with capacity signals from assignments and availability rows."
      >
        {rows.length ? (
          <DataTable columns={["Teacher", "Specialty", "Timezone", "Students", "Availability"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No teachers yet. Run the database seed.</p>
        )}
      </SectionCard>
    </div>
  );
}
