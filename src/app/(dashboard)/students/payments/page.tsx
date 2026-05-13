import { auth } from "@/auth";
import { BuyPackagesSection } from "@/components/payments/buy-packages";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { listActivePackagesForCatalog } from "@/app/actions/package-purchase";
import { getFamilyPaymentsTable, listStudentsForFamilyPicker } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

export default async function StudentsPaymentsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role as UserRole | undefined;
  if (!userId || !role) return null;

  const [{ rows, dbError }, packages, students] = await Promise.all([
    getFamilyPaymentsTable(userId, role),
    listActivePackagesForCatalog(),
    listStudentsForFamilyPicker(userId, role),
  ]);

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard
        title="Payments and packages"
        description="Parents pay for linked children; students with their own login pay for themselves. The signed-in user is stored as payer on each payment."
      >
        <BuyPackagesSection
          packages={packages.map((p) => ({
            id: p.id,
            name: p.name,
            currency: p.currency,
            price: p.price,
            sessionCredits: p.sessionCredits,
          }))}
          students={students}
        />
        <div className="mt-8">
          {rows.length ? (
            <DataTable columns={["Date", "Item", "Amount", "Method", "Status"]} rows={rows} />
          ) : (
            <p className="text-sm text-slate-500">No payments yet.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
