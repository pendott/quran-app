import { prisma } from "@/lib/db";
import { isDatabaseUnavailable } from "@/server/db-guard";
import { remainingCredits } from "@/server/credits/grant-credits";
import type { TableRow } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export type AdminCreditStudentOption = {
  id: string;
  label: string;
  parentNames: string;
  remaining: number;
};

export async function getAdminCreditGrantOptions(): Promise<{
  students: AdminCreditStudentOption[];
  dbError: boolean;
}> {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      orderBy: { displayName: "asc" },
      include: {
        parents: { include: { parent: { include: { user: true } } } },
        packagePurchases: { where: { status: "ACTIVE" } },
      },
    });

    const options: AdminCreditStudentOption[] = students.map((s) => {
      const parentNames =
        s.parents.map((ps) => ps.parent.user.name ?? ps.parent.user.email).join(", ") || "No parent linked";
      const remaining = s.packagePurchases.reduce((sum, p) => sum + remainingCredits(p), 0);
      return {
        id: s.id,
        label: s.displayName,
        parentNames,
        remaining,
      };
    });

    return { students: options, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { students: [], dbError: true };
  }
}

export async function getAdminCreditsLedger(): Promise<{ rows: TableRow[]; dbError: boolean }> {
  try {
    const purchases = await prisma.packagePurchase.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        package: true,
        purchasedBy: true,
        student: {
          include: {
            parents: { include: { parent: { include: { user: true } } } },
          },
        },
      },
    });

    const rows: TableRow[] = purchases.map((p) => {
      const parents =
        p.student.parents.map((ps) => ps.parent.user.name ?? ps.parent.user.email).join(", ") || "—";
      const rem = remainingCredits(p);
      return {
        Student: p.student.displayName,
        Parent: parents,
        Package: p.package.name,
        Remaining: `${rem} / ${p.totalCredits ?? 0}`,
        Used: String(p.usedCredits),
        Expires: p.expiresAt ? formatDateTime(p.expiresAt) : "—",
      };
    });

    return { rows, dbError: false };
  } catch (e) {
    if (!isDatabaseUnavailable(e)) console.error(e);
    return { rows: [], dbError: true };
  }
}
