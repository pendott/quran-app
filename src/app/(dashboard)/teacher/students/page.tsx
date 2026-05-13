import { auth } from "@/auth";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getTeacherByUserId, getTeacherStudentsTable } from "@/server/queries/teacher";

export default async function TeacherStudentsPage() {
  const session = await auth();
  const teacher = session?.user?.id ? await getTeacherByUserId(session.user.id) : null;

  if (!teacher) {
    return (
      <SectionCard title="Teacher profile" description="No teacher profile linked.">
        <p className="text-sm text-slate-600">Use a teacher account after seeding.</p>
      </SectionCard>
    );
  }

  const { rows, dbError } = await getTeacherStudentsTable(teacher.id);

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Assigned students" description="Learners assigned to you with the latest note snapshot.">
        {rows.length ? (
          <DataTable columns={["Student", "LastClass", "LastSurah", "Focus", "Homework"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No assigned students.</p>
        )}
      </SectionCard>
    </div>
  );
}
