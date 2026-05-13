import Link from "next/link";
import { auth } from "@/auth";
import { ClassNoteFormPreview } from "@/components/dashboard/class-note-form-preview";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  getTeacherByUserId,
  getTeacherDashboardStats,
  getTeacherTodaySessionsTable,
} from "@/server/queries/teacher";

export default async function TeacherDashboardPage() {
  const session = await auth();
  const teacher = session?.user?.id ? await getTeacherByUserId(session.user.id) : null;

  if (!teacher) {
    return (
      <SectionCard title="Teacher profile" description="No teacher profile is linked to this account.">
        <p className="text-sm text-slate-600">Sign in as teacher@demo.local after running the seed.</p>
      </SectionCard>
    );
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
            <DataTable columns={["Time", "Student", "Topic", "Join", "Status", "Session"]} rows={todayRows} />
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
