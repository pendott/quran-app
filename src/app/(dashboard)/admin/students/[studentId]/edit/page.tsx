import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEditStudentForm } from "@/components/admin/admin-edit-student-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminStudentForEdit, getAdminUserFormPickers } from "@/server/queries/admin-users";

type Props = { params: Promise<{ studentId: string }> };

export default async function AdminEditStudentPage({ params }: Props) {
  const { studentId } = await params;
  const [student, pickers] = await Promise.all([
    getAdminStudentForEdit(studentId),
    getAdminUserFormPickers(),
  ]);
  if (!student) notFound();

  return (
    <div className="space-y-4">
      <Link href="/admin/students" className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to students
      </Link>

      <SectionCard title="Edit student" description={student.displayName}>
        {pickers.dbError ? (
          <p className="text-sm text-red-600">Could not load form options.</p>
        ) : (
          <AdminEditStudentForm student={student} parents={pickers.parents} teachers={pickers.teachers} />
        )}
      </SectionCard>
    </div>
  );
}
