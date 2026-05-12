import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { studentDirectoryRows } from "@/lib/dashboard-data";

export default function AdminStudentsPage() {
  return (
    <SectionCard
      title="Student management"
      description="Student and parent records with assignment, progress checkpoint, and enrollment status."
    >
      <DataTable
        columns={["Student", "Parent", "Teacher", "Progress", "Status"]}
        rows={studentDirectoryRows}
      />
    </SectionCard>
  );
}
