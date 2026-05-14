import Link from "next/link";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminBookingsTable } from "@/server/queries/admin";

const filters = [
  { label: "All", value: "" },
  { label: "Pending payment", value: "PENDING_PAYMENT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const { rows, dbError } = await getAdminBookingsTable(status);

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard
        title="Booking operations"
        description="Filter by status. Commercial reservation state, package consumption, and reschedule tracking."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (status ?? "") === f.value;
            const href = f.value ? `/admin/bookings?status=${encodeURIComponent(f.value)}` : "/admin/bookings";
            return (
              <Link
                key={f.value || "all"}
                href={href}
                className={
                  active
                    ? "rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        {rows.length ? (
          <DataTable columns={["Booking", "Student", "Teacher", "Slot", "Source", "Status"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No bookings in this filter.</p>
        )}
      </SectionCard>
    </div>
  );
}
