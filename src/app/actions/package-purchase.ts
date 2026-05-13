"use server";

import { PaymentStatus, SessionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/integrations/payments/manual";
import { getFamilyStudentIds } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

const schema = z.object({
  studentId: z.string().min(1),
  packageId: z.string().min(1),
});

export async function purchasePackageForStudentAction(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { ok: false as const, error: "Not signed in" };
  }

  const parsed = schema.safeParse({
    studentId: formData.get("studentId"),
    packageId: formData.get("packageId"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid form" };
  }

  const { studentId, packageId } = parsed.data;
  const userId = session.user.id;
  const role = session.user.role as UserRole;
  const allowed = await getFamilyStudentIds(userId, role);
  if (!allowed.includes(studentId)) {
    return { ok: false as const, error: "Student not in your account" };
  }

  const pkg = await prisma.package.findFirst({ where: { id: packageId, isActive: true } });
  if (!pkg) {
    return { ok: false as const, error: "Package not found" };
  }

  const provider = getPaymentProvider();
  const checkout = await provider.createCheckoutSession({
    amount: pkg.price.toString(),
    currency: pkg.currency,
    description: pkg.name,
    metadata: { studentId, packageId },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.packagePurchase.create({
        data: {
          packageId: pkg.id,
          studentId,
          purchasedById: userId,
          status: "ACTIVE",
          totalCredits: pkg.sessionCredits ?? 0,
          usedCredits: 0,
        },
      });

      await tx.payment.create({
        data: {
          payerId: userId,
          studentId,
          packagePurchaseId: purchase.id,
          status: PaymentStatus.PAID,
          amount: pkg.price,
          currency: pkg.currency,
          provider: "MANUAL",
          providerReference: checkout.providerReference,
          paidAt: new Date(),
        },
      });
    });

    revalidatePath("/students/payments");
    revalidatePath("/students");
    return { ok: true as const, error: null as string | null };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not complete purchase" };
  }
}

export async function listActivePackagesForCatalog() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    take: 10,
  });
}
