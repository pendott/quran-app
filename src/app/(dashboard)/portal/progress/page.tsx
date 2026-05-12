import { ProgressTimeline } from "@/components/dashboard/progress-timeline";
import { SectionCard } from "@/components/dashboard/section-card";
import { progressTimeline } from "@/lib/dashboard-data";

export default function PortalProgressPage() {
  return (
    <SectionCard
      title="Progress history"
      description="Student-facing learning timeline organized around notes captured after each class session."
    >
      <ProgressTimeline items={progressTimeline} />
    </SectionCard>
  );
}
