import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { studentPaymentRows } from "@/lib/dashboard-data";

export default function PortalPaymentsPage() {
  return (
    <SectionCard
      title="Payments and packages"
      description="Family-side receipt history for single sessions, bundles, monthly plans, and refunds."
    >
      <DataTable
        columns={["Date", "Item", "Amount", "Method", "Status"]}
        rows={studentPaymentRows}
      />
    </SectionCard>
  );
}
