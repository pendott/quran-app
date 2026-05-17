import Link from "next/link";
import { PaymentStatus, type Prisma } from "@prisma/client";
import { DbBanner } from "@/components/dashboard/db-banner";
import { SectionCard } from "@/components/dashboard/section-card";
import { AdminMarkPaidButton } from "@/components/admin/admin-mark-paid-button";
import { formatMYR } from "@/lib/format";
import { prisma } from "@/lib/db";

const paymentInclude = {
  student: true,
  booking: true,
  packagePurchase: { include: { package: true } },
} satisfies Prisma.PaymentInclude;

type PaymentRow = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;

const filters = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const valid =
    status != null && status !== "" && Object.values(PaymentStatus).includes(status as PaymentStatus);
  const where = valid ? { status: status as PaymentStatus } : {};

  let dbError = false;
  let payments: PaymentRow[] = [];
  try {
    payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: paymentInclude,
    });
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-4">
      {dbError ? <DbBanner message="Database unavailable." /> : null}
      <SectionCard title="Payment ledger" description="Gateway transactions. Mark manual bank transfers as paid when verified.">
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (status ?? "") === f.value;
            const href = f.value ? `/admin/payments?status=${encodeURIComponent(f.value)}` : "/admin/payments";
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

        {payments.length ? (
          <div className="overflow-hidden rounded-[24px] border border-slate-200/80">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/90">
                <tr>
                  {["Ref", "Student", "Amount", "Gateway", "Purpose", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-xs">{p.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{p.student.displayName}</td>
                    <td className="px-4 py-3">{formatMYR(p.amount)}</td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3">
                      {p.bookingId
                        ? `Session`
                        : p.packagePurchase
                          ? p.packagePurchase.package.name
                          : "—"}
                    </td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3">
                      {p.status === "PENDING" ? <AdminMarkPaidButton paymentId={p.id} /> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No payments in this filter.</p>
        )}
      </SectionCard>
    </div>
  );
}
