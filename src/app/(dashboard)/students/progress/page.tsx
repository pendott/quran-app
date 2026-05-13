import { ProgressTimeline } from "@/components/dashboard/progress-timeline";
import { SectionCard } from "@/components/dashboard/section-card";
import { progressTimeline } from "@/lib/dashboard-data";

export default function StudentsProgressPage() {
  return (
    <SectionCard
      title="Progress history"
      description="Each entry reflects teacher notes and targets after live sessions."
    >
      <ProgressTimeline items={progressTimeline} />
    </SectionCard>
  );
}
