import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { recordingRows } from "@/lib/dashboard-data";

export default function PortalRecordingsPage() {
  return (
    <SectionCard
      title="Class recordings"
      description="Recording metadata ready for S3 or local object storage providers."
    >
      <DataTable
        columns={["Date", "Session", "Teacher", "Access", "Notes"]}
        rows={recordingRows}
      />
    </SectionCard>
  );
}
