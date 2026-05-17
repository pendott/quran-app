import { AdminCreateTeacherForm } from "@/components/admin/admin-create-teacher-form";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminTeachersDirectory } from "@/server/queries/admin";

export default async function AdminTeachersPage() {
  const { rows, dbError } = await getAdminTeachersDirectory();

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}

      <SectionCard
        title="Add teacher"
        description="Create a teacher login and profile. Set availability after creation."
      >
        <AdminCreateTeacherForm />
      </SectionCard>

      <SectionCard
        title="Teacher directory"
        description="Profiles, student assignments, and availability rules."
      >
        {rows.length ? (
          <DataTable columns={["Teacher", "Specialty", "Timezone", "Students", "Availability", "Manage"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No teachers yet. Create one above or run the database seed.</p>
        )}
      </SectionCard>
    </div>
  );
}
