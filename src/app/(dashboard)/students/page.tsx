import { auth } from "@/auth";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { ProgressTimeline } from "@/components/dashboard/progress-timeline";
import { SectionCard } from "@/components/dashboard/section-card";
import { MeetingJoinLink } from "@/components/dashboard/meeting-join-link";
import { StatCard } from "@/components/dashboard/stat-card";
import { getFamilyDashboard } from "@/server/queries/family";

export default async function StudentsHomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId || !role) {
    return null;
  }

  const { stats, timeline, recordingRows, nextClass, dbError } = await getFamilyDashboard(userId, role);

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      {nextClass ? (
        <SectionCard
          title="Next class — meeting link"
          description={`${nextClass.scheduledAt} with ${nextClass.teacherName}`}
        >
          <MeetingJoinLink
            joinUrl={nextClass.joinUrl}
            provider={nextClass.provider as "ZOOM" | "MANUAL" | null}
            pendingReason={nextClass.pendingReason ?? undefined}
          />
        </SectionCard>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Quran progress timeline"
          description="History from teacher notes after each class."
        >
          {timeline.length ? (
            <ProgressTimeline items={timeline} />
          ) : (
            <p className="text-sm text-slate-500">No progress notes yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Recent recordings" description="Replays linked to completed sessions.">
          {recordingRows.length ? (
            <DataTable columns={["Date", "Session", "Teacher", "Access", "Notes"]} rows={recordingRows} />
          ) : (
            <p className="text-sm text-slate-500">No recordings yet.</p>
          )}
        </SectionCard>
      </section>
    </div>
  );
}
