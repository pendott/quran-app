import { auth } from "@/auth";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getFamilyDashboard } from "@/server/queries/family";

export default async function StudentsRecordingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId || !role) return null;

  const { recordingRows, dbError } = await getFamilyDashboard(userId, role);

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Class recordings" description="Playback metadata for your family.">
        {recordingRows.length ? (
          <DataTable columns={["Date", "Session", "Teacher", "Access", "Notes"]} rows={recordingRows} />
        ) : (
          <p className="text-sm text-slate-500">No recordings yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
