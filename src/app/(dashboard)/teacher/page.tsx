import Link from "next/link";
import { ClassNoteFormPreview } from "@/components/dashboard/class-note-form-preview";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { teacherStats, todayScheduleRows } from "@/lib/dashboard-data";

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {teacherStats.map((stat) => (
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
          title="Today’s schedule"
          description="Starter table for class launch, attendance, and meeting link actions."
        >
          <DataTable
            columns={["Time", "Student", "Topic", "Join", "Status"]}
            rows={todayScheduleRows}
          />
        </SectionCard>

        <SectionCard
          title="Teacher class note form"
          description="Preview of the structured note capture for surah, ayah, tajwid, homework, and next target."
        >
          <ClassNoteFormPreview />
        </SectionCard>
      </section>
    </div>
  );
}
