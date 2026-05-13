"use server";

import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getFamilyStudentIds } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

const startSchema = z.object({
  studentId: z.string().min(1),
  packageId: z.string().min(1),
});

export type StartMockCheckoutState =
  | { ok: true; paymentId: string; error: null }
  | { ok: false; paymentId: null; error: string };

export async function startMockMalaysiaPackageCheckoutAction(
  _prev: StartMockCheckoutState | undefined,
  formData: FormData,
): Promise<StartMockCheckoutState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { ok: false, paymentId: null, error: "Not signed in" };
  }

  const parsed = startSchema.safeParse({
    studentId: formData.get("studentId"),
    packageId: formData.get("packageId"),
  });
  if (!parsed.success) {
    return { ok: false, paymentId: null, error: "Invalid form" };
  }

  const { studentId, packageId } = parsed.data;
  const userId = session.user.id;
  const role = session.user.role as UserRole;
  const allowed = await getFamilyStudentIds(userId, role);
  if (!allowed.includes(studentId)) {
    return { ok: false, paymentId: null, error: "Student not in your account" };
  }

  const pkg = await prisma.package.findFirst({ where: { id: packageId, isActive: true } });
  if (!pkg) {
    return { ok: false, paymentId: null, error: "Package not found" };
  }

  const checkoutReference = `MOCK-MYR-${Date.now().toString(36).toUpperCase()}`;

  try {
    const payment = await prisma.payment.create({
      data: {
        payerId: userId,
        studentId,
        status: PaymentStatus.PENDING,
        amount: pkg.price,
        currency: pkg.currency,
        provider: "MANUAL",
        checkoutReference,
        metadata: {
          mockGateway: "malaysia-fpx",
          packageId: pkg.id,
          packageName: pkg.name,
        },
      },
    });

    revalidatePath("/students/payments");
    return { ok: true, paymentId: payment.id, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, paymentId: null, error: "Could not start checkout" };
  }
}

export async function finalizeMockMalaysiaPackagePaymentAction(paymentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.payerId !== session.user!.id) throw new Error("Invalid payment");
      if (payment.status === PaymentStatus.FAILED) {
        throw new Error("aborted");
      }
      if (payment.status === PaymentStatus.PAID && payment.packagePurchaseId) {
        return;
      }
      if (payment.status !== PaymentStatus.PENDING) throw new Error("Payment already closed");

      const meta = payment.metadata as { packageId?: string } | null;
      const packageId = meta?.packageId;
      if (!packageId) throw new Error("Missing package on payment");

      const pkg = await tx.package.findFirst({ where: { id: packageId, isActive: true } });
      if (!pkg) throw new Error("Package unavailable");

      const purchase = await tx.packagePurchase.create({
        data: {
          packageId: pkg.id,
          studentId: payment.studentId,
          purchasedById: payment.payerId,
          status: "ACTIVE",
          totalCredits: pkg.sessionCredits ?? 0,
          usedCredits: 0,
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          packagePurchaseId: purchase.id,
          paidAt: new Date(),
          providerReference: payment.checkoutReference ?? `fpx_ok_${payment.id}`,
        },
      });
    });

    revalidatePath("/students/payments");
    revalidatePath("/students");
    return { ok: true as const, error: null as string | null };
  } catch (e) {
    if (e instanceof Error && e.message === "aborted") {
      return { ok: false as const, error: "aborted" as const };
    }
    console.error(e);
    return { ok: false as const, error: "Payment could not be completed" };
  }
}

export async function failMockMalaysiaPackagePaymentAction(paymentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, payerId: session.user.id, status: PaymentStatus.PENDING },
    });
    if (!payment) {
      return { ok: false as const, error: "Payment not found or already processed" };
    }
    const prevMeta =
      payment.metadata && typeof payment.metadata === "object" && !Array.isArray(payment.metadata)
        ? (payment.metadata as Record<string, unknown>)
        : {};
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        metadata: { ...prevMeta, mockDeclined: true },
      },
    });
    revalidatePath("/students/payments");
    return { ok: true as const, error: null as string | null };
  } catch {
    return { ok: false as const, error: "Could not update payment" };
  }
}
