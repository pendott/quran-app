import { DataTable } from "@/components/dashboard/data-table";
import { ProgressTimeline } from "@/components/dashboard/progress-timeline";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { portalStats, progressTimeline, recordingRows } from "@/lib/dashboard-data";

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {portalStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Quran progress timeline"
          description="Family-facing history of surah coverage, tajwid focus, and homework."
        >
          <ProgressTimeline items={progressTimeline} />
        </SectionCard>

        <SectionCard
          title="Recent recordings"
          description="Preview of the recording vault that is linked to completed class sessions."
        >
          <DataTable
            columns={["Date", "Session", "Teacher", "Access", "Notes"]}
            rows={recordingRows}
          />
        </SectionCard>
      </section>
    </div>
  );
}
