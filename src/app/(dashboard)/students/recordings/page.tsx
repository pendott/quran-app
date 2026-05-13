import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { recordingRows } from "@/lib/dashboard-data";

export default function StudentsRecordingsPage() {
  return (
    <SectionCard
      title="Class recordings"
      description="Secure playback for sessions your teachers marked as complete."
    >
      <DataTable columns={["Date", "Session", "Teacher", "Access", "Notes"]} rows={recordingRows} />
    </SectionCard>
  );
}
