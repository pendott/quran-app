import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEditTeacherForm } from "@/components/admin/admin-edit-teacher-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminTeacherForEdit } from "@/server/queries/admin-users";

type Props = { params: Promise<{ teacherId: string }> };

export default async function AdminEditTeacherPage({ params }: Props) {
  const { teacherId } = await params;
  const teacher = await getAdminTeacherForEdit(teacherId);
  if (!teacher) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/teachers" className="text-sm font-medium text-teal-700 hover:underline">
          ← Back to teachers
        </Link>
        <Link
          href={`/admin/teachers/${teacherId}/availability`}
          className="text-sm font-medium text-slate-600 hover:text-teal-700 hover:underline"
        >
          Manage availability →
        </Link>
      </div>

      <SectionCard
        title="Edit teacher"
        description={`${teacher.name} · ${teacher.email}`}
      >
        <AdminEditTeacherForm teacher={teacher} />
      </SectionCard>
    </div>
  );
}
