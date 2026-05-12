import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { paymentRows } from "@/lib/dashboard-data";

export default function AdminPaymentsPage() {
  return (
    <SectionCard
      title="Payment ledger"
      description="Gateway-ready payment table for per-session and package transactions."
    >
      <DataTable
        columns={["Payment", "Student", "Amount", "Gateway", "Purpose", "Status"]}
        rows={paymentRows}
      />
    </SectionCard>
  );
}
