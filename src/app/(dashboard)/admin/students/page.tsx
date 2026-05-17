import Link from "next/link";
import { Search } from "lucide-react";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { getAdminStudentRoster } from "@/server/queries/admin";

export default async function AdminStudentsPage() {
  const { rows, stats, dbError } = await getAdminStudentRoster();

  return (
    <div className="space-y-6">
      {dbError ? (
        <DbBanner message="Database unavailable. Set DATABASE_URL, run npm run db:push and npm run db:seed." />
      ) : null}
      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard
        title="Student roster"
        description="Learner profiles, parent links, assigned teachers, and progress checkpoints."
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              placeholder="Search by student or parent name…"
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none ring-teal-500/0 transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-500/20"
              aria-label="Search students"
            />
          </div>
          <Link
            href="/api/admin/reports/payments-export"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Export payments CSV
          </Link>
        </div>

        {rows.length ? (
          <DataTable columns={["Student", "Parent", "Teacher", "Progress", "Status", "Manage"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No students yet. Run the database seed.</p>
        )}

        <p className="mt-5 text-sm leading-6 text-slate-500">
          <Link href="/admin/parents" className="font-medium text-teal-700 hover:underline">
            Manage parents
          </Link>
          {" · "}
          <Link href="/admin/teachers" className="font-medium text-teal-700 hover:underline">
            Manage teachers
          </Link>
        </p>
      </SectionCard>
    </div>
  );
}
