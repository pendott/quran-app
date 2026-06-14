import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDeleteStudentForm } from "@/components/admin/admin-delete-student-form";
import { AdminEditStudentForm } from "@/components/admin/admin-edit-student-form";
import { AdminGrantCreditsForm } from "@/components/admin/admin-grant-credits-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminCreditGrantOptions } from "@/server/queries/admin-credits";
import { getAdminStudentForEdit, getAdminUserFormPickers } from "@/server/queries/admin-users";

type Props = { params: Promise<{ studentId: string }> };

export default async function AdminEditStudentPage({ params }: Props) {
  const { studentId } = await params;
  const [student, pickers, { students: creditOptions }] = await Promise.all([
    getAdminStudentForEdit(studentId),
    getAdminUserFormPickers(),
    getAdminCreditGrantOptions(),
  ]);
  if (!student) notFound();

  const current = creditOptions.find((s) => s.id === studentId);

  return (
    <div className="space-y-4">
      <Link href="/admin/students" className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to students
      </Link>

      <SectionCard title="Session credits" description="Credits are used when booking classes with a package.">
        {current ? (
          <p className="mb-4 text-sm text-slate-600">
            Current balance: <strong>{current.remaining} credit(s) remaining</strong>
          </p>
        ) : null}
        <AdminGrantCreditsForm students={creditOptions} defaultStudentId={studentId} />
        <p className="mt-3 text-sm text-slate-500">
          <Link href="/admin/credits" className="font-medium text-teal-700 hover:underline">
            View all credit balances
          </Link>
        </p>
      </SectionCard>

      <SectionCard title="Edit student" description={student.displayName}>
        {pickers.dbError ? (
          <p className="text-sm text-red-600">Could not load form options.</p>
        ) : (
          <AdminEditStudentForm student={student} parents={pickers.parents} teachers={pickers.teachers} />
        )}
      </SectionCard>

      <SectionCard
        title="Delete student"
        description="Permanently remove this learner profile from jomngaji.my."
      >
        <AdminDeleteStudentForm student={student} />
      </SectionCard>
    </div>
  );
}
