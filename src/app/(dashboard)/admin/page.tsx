import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { adminStats, pendingPaymentRows, upcomingClassRows } from "@/lib/dashboard-data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Upcoming classes"
          description="Live view placeholder for today and tomorrow’s confirmed sessions."
        >
          <DataTable
            columns={["Student", "Teacher", "Time", "Plan", "Status"]}
            rows={upcomingClassRows}
          />
        </SectionCard>

        <SectionCard
          title="Pending payments"
          description="Queue for callbacks, approvals, and manual follow-up."
        >
          <DataTable
            columns={["Invoice", "Student", "Amount", "Method", "Status"]}
            rows={pendingPaymentRows}
          />
        </SectionCard>
      </section>

      <SectionCard
        title="Foundation status"
        description="Phase 1 scaffolds the data and UI needed for pricing, reports, refunds, recordings, and reminders."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Teacher and student directories are separated into their own pages.",
            "Bookings, class sessions, notes, meeting links, and reminders are modeled separately in Prisma.",
            "Pricing rules and cancellation rules are ready for Malaysia-friendly gateway adapters.",
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
              {item}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
