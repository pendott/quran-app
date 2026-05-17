"use server";

import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createBillplzBill } from "@/lib/integrations/payments/billplz";
import { getFamilyStudentIds } from "@/server/queries/family";
import { completePendingPayment } from "@/server/payments/complete-pending-payment";
import type { UserRole } from "@/lib/types";

const startSchema = z.object({
  studentId: z.string().min(1),
  packageId: z.string().min(1),
});

export type StartMockCheckoutState =
  | { ok: true; paymentId: string; billPlzUrl: string | null; error: null }
  | { ok: false; paymentId: null; billPlzUrl: null; error: string };

export async function startMockMalaysiaPackageCheckoutAction(
  _prev: StartMockCheckoutState | undefined,
  formData: FormData,
): Promise<StartMockCheckoutState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    return { ok: false, paymentId: null, billPlzUrl: null, error: "Not signed in" };
  }

  const parsed = startSchema.safeParse({
    studentId: formData.get("studentId"),
    packageId: formData.get("packageId"),
  });
  if (!parsed.success) {
    return { ok: false, paymentId: null, billPlzUrl: null, error: "Invalid form" };
  }

  const { studentId, packageId } = parsed.data;
  const userId = session.user.id;
  const role = session.user.role as UserRole;
  const allowed = await getFamilyStudentIds(userId, role);
  if (!allowed.includes(studentId)) {
    return { ok: false, paymentId: null, billPlzUrl: null, error: "Student not in your account" };
  }

  const pkg = await prisma.package.findFirst({ where: { id: packageId, isActive: true } });
  if (!pkg) {
    return { ok: false, paymentId: null, billPlzUrl: null, error: "Package not found" };
  }

  const providerMode = process.env.PAYMENT_PROVIDER ?? "mock";
  const useBillplz = providerMode === "billplz";

  try {
    const checkoutRef = useBillplz ? `pending-${Date.now()}` : `MOCK-MYR-${Date.now().toString(36).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        payerId: userId,
        studentId,
        status: PaymentStatus.PENDING,
        amount: pkg.price,
        currency: pkg.currency,
        provider: useBillplz ? "BILLPLZ" : "MANUAL",
        checkoutReference: checkoutRef,
        metadata: useBillplz
          ? { packageId: pkg.id, packageName: pkg.name }
          : { mockGateway: "malaysia-fpx", packageId: pkg.id, packageName: pkg.name },
      },
    });

    if (useBillplz) {
      const payerEmail = session.user.email ?? "payer@demo.local";
      const payerName = session.user.name ?? payerEmail;
      const bill = await createBillplzBill({
        title: pkg.name,
        amountMYR: Number(pkg.price),
        email: payerEmail,
        name: payerName,
        reference1: payment.id,
      });
      if (!bill.ok) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            metadata: {
              ...((payment.metadata as Record<string, unknown> | null) ?? {}),
              billplzError: bill.error,
            },
          },
        });
        return { ok: false, paymentId: null, billPlzUrl: null, error: bill.error };
      }
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          checkoutReference: bill.billId,
          providerReference: bill.billId,
          metadata: {
            ...((payment.metadata as Record<string, unknown> | null) ?? {}),
            billplzBillId: bill.billId,
          },
        },
      });
      revalidatePath("/students/payments");
      return { ok: true, paymentId: payment.id, billPlzUrl: bill.billUrl, error: null };
    }

    revalidatePath("/students/payments");
    return { ok: true, paymentId: payment.id, billPlzUrl: null, error: null };
  } catch (e) {
    console.error(e);
    return { ok: false, paymentId: null, billPlzUrl: null, error: "Could not start checkout" };
  }
}

export async function finalizeMockMalaysiaPackagePaymentAction(paymentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }

  const result = await completePendingPayment(paymentId, session.user.id);
  if (!result.ok) {
    if (result.error === "aborted") {
      return { ok: false as const, error: "aborted" as const };
    }
    return { ok: false as const, error: result.error };
  }

  revalidatePath("/students/payments");
  revalidatePath("/students");
  return { ok: true as const, error: null as string | null };
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
