import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminPaymentsTable } from "@/server/queries/admin";

export default async function AdminPaymentsPage() {
  const { rows, dbError } = await getAdminPaymentsTable();

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard
        title="Payment ledger"
        description="Gateway-ready payment table for per-session and package transactions."
      >
        {rows.length ? (
          <DataTable columns={["Payment", "Student", "Amount", "Gateway", "Purpose", "Status"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No payments yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
