import { auth } from "@/auth";
import { DbBanner } from "@/components/dashboard/db-banner";
import { ProgressTimeline } from "@/components/dashboard/progress-timeline";
import { SectionCard } from "@/components/dashboard/section-card";
import { getFamilyDashboard } from "@/server/queries/family";

export default async function StudentsProgressPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId || !role) return null;

  const { timeline, dbError } = await getFamilyDashboard(userId, role);

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Progress history" description="Teacher notes and targets over time.">
        {timeline.length ? (
          <ProgressTimeline items={timeline} />
        ) : (
          <p className="text-sm text-slate-500">No notes yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
