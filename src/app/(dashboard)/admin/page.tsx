import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { adminStats, pendingPaymentRows, upcomingClassRows } from "@/lib/dashboard-data";

const quickLinks = [
  { href: "/admin/students", label: "Students", detail: "Roster, parents, assignments" },
  { href: "/admin/teachers", label: "Teachers", detail: "Profiles and availability" },
  { href: "/admin/bookings", label: "Bookings", detail: "Schedule and status" },
  { href: "/admin/payments", label: "Payments", detail: "Gateway and refunds" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="Quick access" description="Jump to the areas you use most during the day.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 transition hover:border-teal-200 hover:bg-teal-50/50"
            >
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Upcoming classes"
          description="Confirmed and pending sessions for the next 48 hours."
        >
          <DataTable columns={["Student", "Teacher", "Time", "Plan", "Status"]} rows={upcomingClassRows} />
        </SectionCard>

        <SectionCard title="Pending payments" description="Follow up before classes start without credits.">
          <DataTable columns={["Invoice", "Student", "Amount", "Method", "Status"]} rows={pendingPaymentRows} />
        </SectionCard>
      </section>
    </div>
  );
}
