import Link from "next/link";
import { auth } from "@/auth";
import { ClassNoteFormPreview } from "@/components/dashboard/class-note-form-preview";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { autoCompletePastSessionsForTeacher } from "@/server/booking/auto-complete-past-sessions";
import { isSchemaOutOfDate } from "@/server/db-guard";
import {
  getTeacherByUserId,
  getTeacherDashboardStats,
  getTeacherTodaySessionsTable,
} from "@/server/queries/teacher";

export default async function TeacherDashboardPage() {
  const session = await auth();
  let teacher = null;
  try {
    teacher = session?.user?.id ? await getTeacherByUserId(session.user.id) : null;
  } catch (error) {
    if (isSchemaOutOfDate(error)) {
      return (
        <SectionCard title="Database update required" description="The app was upgraded but the database schema was not.">
          <p className="text-sm text-slate-600">
            On the server run:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">docker compose exec web npx prisma migrate deploy</code>
            , then restart the web container.
          </p>
        </SectionCard>
      );
    }
    throw error;
  }

  if (!teacher) {
    return (
      <SectionCard title="Teacher profile" description="No teacher profile is linked to this account.">
        <p className="text-sm text-slate-600">
          If you were just approved as a teacher, sign out and sign in again with the password from the admin team.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          For local demo: sign in as <strong>teacher@demo.local</strong> after running the seed.
        </p>
      </SectionCard>
    );
  }

  try {
    await autoCompletePastSessionsForTeacher(teacher.id);
  } catch (error) {
    console.error("autoCompletePastSessionsForTeacher", error);
  }

  const [{ stats, dbError }, { rows: todayRows, dbError: todayErr }] = await Promise.all([
    getTeacherDashboardStats(teacher.id),
    getTeacherTodaySessionsTable(teacher.id),
  ]);

  return (
    <div className="space-y-6">
      {dbError || todayErr ? <DbBanner message="Database unavailable." /> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="Shortcuts" description="Move quickly between your main teaching workflows.">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/teacher/classes"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            All classes
          </Link>
          <Link
            href="/teacher/availability"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            My availability
          </Link>
          <Link
            href="/teacher/students"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            My students
          </Link>
        </div>
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Today's schedule"
          description="Sessions scheduled for the current UTC calendar day."
        >
          {todayRows.length ? (
            <DataTable columns={["Time", "Student", "Topic", "Zoom / join", "Status", "Session"]} rows={todayRows} />
          ) : (
            <p className="text-sm text-slate-500">No classes today in this window.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Teacher class note form"
          description="Structured note capture for surah, ayah, tajwid, homework, and next target."
        >
          <ClassNoteFormPreview />
        </SectionCard>
      </section>
    </div>
  );
}
