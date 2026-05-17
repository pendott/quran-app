import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityManager } from "@/components/availability/availability-manager";
import { DbBanner } from "@/components/dashboard/db-banner";
import { SectionCard } from "@/components/dashboard/section-card";
import { getTeacherAvailabilityBundle } from "@/server/queries/availability";

type Props = {
  params: Promise<{ teacherId: string }>;
  searchParams: Promise<{ month?: string }>;
};

export default async function AdminTeacherAvailabilityPage({ params, searchParams }: Props) {
  const { teacherId } = await params;
  const { month } = await searchParams;

  let bundle;
  try {
    bundle = await getTeacherAvailabilityBundle(teacherId, month);
  } catch {
    return <DbBanner message="Database unavailable." />;
  }

  if (!bundle.teacher) notFound();

  const name = bundle.teacher.user.name ?? bundle.teacher.user.email;

  return (
    <div className="space-y-4">
      <Link href="/admin/teachers" className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to teachers
      </Link>
      <SectionCard title="Teacher availability" description={`Edit bookable hours for ${name}.`}>
        <AvailabilityManager
          teacherId={teacherId}
          teacherName={name}
          monthKey={bundle.monthKey}
          recurring={bundle.recurring}
          exceptions={bundle.exceptions}
          basePath={`/admin/teachers/${teacherId}/availability`}
          isAdmin
        />
      </SectionCard>
    </div>
  );
}
