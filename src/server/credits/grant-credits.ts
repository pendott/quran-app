import { PackagePurchaseStatus, PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOrCreateAdminCreditPackage } from "@/server/credits/admin-credit-package";

export type GrantCreditsInput = {
  studentId: string;
  credits: number;
  grantedByAdminId: string;
  note?: string;
  expiresInDays?: number;
};

export type GrantCreditsResult =
  | { ok: true; purchaseId: string; remainingCredits: number }
  | { ok: false; error: string };

async function resolvePurchasedByUserId(studentId: string, fallbackUserId: string) {
  const link = await prisma.parentStudent.findFirst({
    where: { studentId },
    include: { parent: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (link?.parent.userId) return link.parent.userId;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { userId: true },
  });
  if (student?.userId) return student.userId;

  return fallbackUserId;
}

export async function grantCreditsToStudent(input: GrantCreditsInput): Promise<GrantCreditsResult> {
  const credits = Math.floor(input.credits);
  if (credits < 1 || credits > 500) {
    return { ok: false, error: "Credits must be between 1 and 500" };
  }

  const student = await prisma.student.findUnique({ where: { id: input.studentId } });
  if (!student) return { ok: false, error: "Student not found" };

  const adminPkg = await getOrCreateAdminCreditPackage();
  const purchasedById = await resolvePurchasedByUserId(input.studentId, input.grantedByAdminId);

  const expiresAt =
    input.expiresInDays && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const grantMeta = {
    type: "admin_credit_grant",
    credits,
    note: input.note?.trim() || null,
    grantedBy: input.grantedByAdminId,
    grantedAt: new Date().toISOString(),
  };

  try {
    return await prisma.$transaction(async (tx) => {
      let purchase = await tx.packagePurchase.findFirst({
        where: {
          studentId: input.studentId,
          packageId: adminPkg.id,
          status: PackagePurchaseStatus.ACTIVE,
        },
      });

      if (purchase) {
        const prevMeta = (purchase.metadata as Record<string, unknown> | null) ?? {};
        const history = Array.isArray(prevMeta.grants) ? [...(prevMeta.grants as unknown[])] : [];
        history.push(grantMeta);

        purchase = await tx.packagePurchase.update({
          where: { id: purchase.id },
          data: {
            totalCredits: (purchase.totalCredits ?? 0) + credits,
            expiresAt: purchase.expiresAt && purchase.expiresAt > expiresAt ? purchase.expiresAt : expiresAt,
            metadata: { ...prevMeta, grants: history } as Prisma.InputJsonValue,
          },
        });
      } else {
        purchase = await tx.packagePurchase.create({
          data: {
            packageId: adminPkg.id,
            studentId: input.studentId,
            purchasedById,
            status: PackagePurchaseStatus.ACTIVE,
            totalCredits: credits,
            usedCredits: 0,
            expiresAt,
            metadata: { grants: [grantMeta] } as Prisma.InputJsonValue,
          },
        });
      }

      await tx.payment.create({
        data: {
          payerId: purchasedById,
          studentId: input.studentId,
          packagePurchaseId: purchase.id,
          provider: PaymentProvider.MANUAL,
          status: PaymentStatus.PAID,
          amount: 0,
          currency: "MYR",
          paidAt: new Date(),
          providerReference: `admin_grant_${purchase.id}_${Date.now()}`,
          metadata: grantMeta as Prisma.InputJsonValue,
        },
      });

      const remaining = Math.max(0, (purchase.totalCredits ?? 0) - purchase.usedCredits);
      return { ok: true as const, purchaseId: purchase.id, remainingCredits: remaining };
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not grant credits" };
  }
}

export function remainingCredits(purchase: { totalCredits: number | null; usedCredits: number }) {
  return Math.max(0, (purchase.totalCredits ?? 0) - purchase.usedCredits);
}
