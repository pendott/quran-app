import Link from "next/link";
import { TeacherApplicationStatus } from "@prisma/client";
import { DbBanner } from "@/components/dashboard/db-banner";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminTeacherApplications } from "@/server/queries/teacher-applications";

const statusTabs: { label: string; param?: string }[] = [
  { label: "Pending", param: "PENDING" },
  { label: "Approved", param: "APPROVED" },
  { label: "Rejected", param: "REJECTED" },
  { label: "All", param: "ALL" },
];

function resolveStatusFilter(param?: string): TeacherApplicationStatus | undefined {
  if (!param || param === "PENDING") return TeacherApplicationStatus.PENDING;
  if (param === "ALL") return undefined;
  if (param === "APPROVED") return TeacherApplicationStatus.APPROVED;
  if (param === "REJECTED") return TeacherApplicationStatus.REJECTED;
  return TeacherApplicationStatus.PENDING;
}

export default async function AdminTeacherApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = resolveStatusFilter(params.status);

  const { rows, dbError } = await getAdminTeacherApplications(statusFilter);

  return (
    <div className="space-y-6">
      {dbError ? <DbBanner message="Database unavailable." /> : null}

      <SectionCard
        title="Teacher applications"
        description="Review self-service sign-ups from /teach/apply. Approve to create a teacher account and weekly availability."
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const href = tab.param === "PENDING" || !tab.param
              ? "/admin/teacher-applications"
              : `/admin/teacher-applications?status=${tab.param}`;
            const current = params.status ?? "PENDING";
            const isActive = current === (tab.param ?? "PENDING");
            return (
              <Link
                key={tab.label}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-[#0d4f4f] text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {rows.length ? (
          <DataTable
            columns={["Applicant", "Email", "Subjects", "Submitted", "Status", ""]}
            rows={rows.map((r) => ({
              Applicant: r.name,
              Email: r.email,
              Subjects: r.subjects,
              Submitted: r.submitted,
              Status: r.status,
              "": (
                <Link
                  href={`/admin/teacher-applications/${r.id}`}
                  className="font-semibold text-[#0d4f4f] hover:underline"
                >
                  Review
                </Link>
              ),
            }))}
          />
        ) : (
          <p className="text-sm text-slate-500">No applications in this view.</p>
        )}
      </SectionCard>
    </div>
  );
}
