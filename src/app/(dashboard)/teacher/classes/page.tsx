import { auth } from "@/auth";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getTeacherByUserId, getTeacherClassesTable } from "@/server/queries/teacher";

export default async function TeacherClassesPage() {
  const session = await auth();
  const teacher = session?.user?.id ? await getTeacherByUserId(session.user.id) : null;

  if (!teacher) {
    return (
      <SectionCard title="Teacher profile" description="No teacher profile linked.">
        <p className="text-sm text-slate-600">Use a teacher account after seeding.</p>
      </SectionCard>
    );
  }

  const { rows, dbError } = await getTeacherClassesTable(teacher.id);

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Upcoming classes" description="Your class sessions with join link status.">
        {rows.length ? (
          <DataTable columns={["Time", "Student", "Topic", "Zoom / join", "Status", "Session"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No sessions yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
