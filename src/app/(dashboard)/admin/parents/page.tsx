import Link from "next/link";
import { CreateFamilyForm } from "@/components/admin/create-family-form";
import { InviteParentForm } from "@/components/admin/invite-parent-form";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminParentsTableRows } from "@/server/queries/admin-users";

export default async function AdminParentsPage() {
  const { rows, dbError } = await getAdminParentsTableRows();

  return (
    <div className="space-y-6">
      {dbError ? (
        <DbBanner message="Database unavailable. Set DATABASE_URL, run npm run db:push and npm run db:seed." />
      ) : null}

      <SectionCard
        title="Onboard parents"
        description="Create a family account or send an invite link for self-service signup."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Create parent + student</h3>
            <CreateFamilyForm />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Invite by email</h3>
            <InviteParentForm />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Parent accounts" description="Login access, billing contact, and linked children.">
        {rows.length ? (
          <DataTable columns={["Parent", "Email", "Students", "Status", "Manage"]} rows={rows} />
        ) : (
          <p className="text-sm text-slate-500">No parents yet. Create a family or run the database seed.</p>
        )}
        <p className="mt-5 text-sm text-slate-500">
          <Link href="/admin/students" className="font-medium text-teal-700 hover:underline">
            View student roster
          </Link>
        </p>
      </SectionCard>
    </div>
  );
}
