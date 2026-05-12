import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { teacherStudentRows } from "@/lib/dashboard-data";

export default function TeacherStudentsPage() {
  return (
    <SectionCard
      title="Assigned students"
      description="Teacher-only history view before class starts."
    >
      <DataTable
        columns={["Student", "LastClass", "LastSurah", "Focus", "Homework"]}
        rows={teacherStudentRows}
      />
    </SectionCard>
  );
}
