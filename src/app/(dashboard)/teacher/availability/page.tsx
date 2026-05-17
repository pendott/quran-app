import { auth } from "@/auth";
import { AvailabilityManager } from "@/components/availability/availability-manager";
import { DbBanner } from "@/components/dashboard/db-banner";
import { SectionCard } from "@/components/dashboard/section-card";
import { getTeacherAvailabilityBundle } from "@/server/queries/availability";
import { getTeacherByUserId } from "@/server/queries/teacher";

type Props = { searchParams: Promise<{ month?: string }> };

export default async function TeacherAvailabilityPage({ searchParams }: Props) {
  const { month } = await searchParams;
  const session = await auth();
  const teacher = session?.user?.id ? await getTeacherByUserId(session.user.id) : null;

  if (!teacher) {
    return (
      <SectionCard title="Availability" description="Set when students can book you.">
        <p className="text-sm text-slate-600">No teacher profile linked to this account.</p>
      </SectionCard>
    );
  }

  let bundle;
  try {
    bundle = await getTeacherAvailabilityBundle(teacher.id, month);
  } catch {
    return <DbBanner message="Database unavailable." />;
  }

  if (!bundle.teacher) {
    return <DbBanner message="Teacher profile not found." />;
  }

  const name = bundle.teacher.user.name ?? bundle.teacher.user.email;

  return (
    <SectionCard
      title="My availability"
      description="Weekly hours and extra dates control which slots parents see when booking."
    >
      <AvailabilityManager
        teacherId={teacher.id}
        teacherName={name}
        monthKey={bundle.monthKey}
        recurring={bundle.recurring}
        exceptions={bundle.exceptions}
        basePath="/teacher/availability"
      />
    </SectionCard>
  );
}
