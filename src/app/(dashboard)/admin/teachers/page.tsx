import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { teacherDirectoryRows } from "@/lib/dashboard-data";

export default function AdminTeachersPage() {
  return (
    <SectionCard
      title="Teacher management"
      description="Editable teacher directory shell for profile, timezone, capacity, and booking readiness."
    >
      <DataTable
        columns={["Teacher", "Specialty", "Timezone", "Students", "Availability"]}
        rows={teacherDirectoryRows}
      />
    </SectionCard>
  );
}
