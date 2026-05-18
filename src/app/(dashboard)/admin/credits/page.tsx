import Link from "next/link";
import { AdminGrantCreditsForm } from "@/components/admin/admin-grant-credits-form";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminCreditGrantOptions, getAdminCreditsLedger } from "@/server/queries/admin-credits";

export default async function AdminCreditsPage() {
  const [{ students, dbError: optionsError }, { rows, dbError: ledgerError }] = await Promise.all([
    getAdminCreditGrantOptions(),
    getAdminCreditsLedger(),
  ]);

  const dbError = optionsError || ledgerError;

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}

      <SectionCard
        title="Add session credits"
        description="Grant package credits to a student. Parents and students see the balance when booking classes. Credits apply to the selected learner only."
      >
        {students.length ? (
          <AdminGrantCreditsForm students={students} />
        ) : (
          <p className="text-sm text-slate-500">
            No active students.{" "}
            <Link href="/admin/parents" className="font-medium text-teal-700 hover:underline">
              Create a family
            </Link>{" "}
            first.
          </p>
        )}
      </SectionCard>

      <SectionCard
        title="Active credit balances"
        description="All active package purchases. Admin grants are merged into one admin credit pool per student."
      >
        {rows.length ? (
          <DataTable columns={["Student", "Parent", "Package", "Remaining", "Used", "Expires"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No active credits yet.</p>
        )}
        <p className="mt-4 text-sm text-slate-500">
          <Link href="/admin/payments" className="font-medium text-teal-700 hover:underline">
            Payment ledger
          </Link>{" "}
          includes $0 manual grant entries for audit.
        </p>
      </SectionCard>
    </div>
  );
}
