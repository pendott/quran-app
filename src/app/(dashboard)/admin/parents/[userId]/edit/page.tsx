import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAddStudentForm } from "@/components/admin/admin-add-student-form";
import { AdminEditParentForm } from "@/components/admin/admin-edit-parent-form";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminParentForEdit } from "@/server/queries/admin-users";

type Props = { params: Promise<{ userId: string }> };

export default async function AdminEditParentPage({ params }: Props) {
  const { userId } = await params;
  const parent = await getAdminParentForEdit(userId);
  if (!parent) notFound();

  return (
    <div className="space-y-4">
      <Link href="/admin/parents" className="text-sm font-medium text-teal-700 hover:underline">
        ← Back to parents
      </Link>

      <SectionCard title="Edit parent" description={`${parent.name} · ${parent.email}`}>
        <AdminEditParentForm parent={parent} />
      </SectionCard>

      <SectionCard title="Linked students" description="Children under this parent account.">
        {parent.students.length ? (
          <ul className="mb-4 space-y-2">
            {parent.students.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm">
                <span className="font-medium text-slate-900">{s.displayName}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-500">{s.isActive ? "Active" : "Inactive"}</span>
                  <Link href={`/admin/students/${s.id}/edit`} className="font-medium text-teal-700 hover:underline">
                    Edit student
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-slate-500">No students linked yet.</p>
        )}
        <AdminAddStudentForm parentUserId={parent.userId} />
      </SectionCard>
    </div>
  );
}
