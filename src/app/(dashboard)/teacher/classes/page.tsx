import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { todayScheduleRows } from "@/lib/dashboard-data";

export default function TeacherClassesPage() {
  return (
    <SectionCard
      title="Upcoming classes"
      description="Dedicated teacher view for attendance and live-session readiness."
    >
      <DataTable
        columns={["Time", "Student", "Topic", "Join", "Status"]}
        rows={todayScheduleRows}
      />
    </SectionCard>
  );
}
