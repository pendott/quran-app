"use server";

import { BookingStatus, PaymentStatus, UserRole, UserStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { cancelBookingInTransaction } from "@/server/booking/cancel-booking";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

const createFamilySchema = z.object({
  parentName: z.string().min(1),
  parentEmail: z.string().email(),
  password: z.string().min(8),
  studentName: z.string().min(1),
});

export async function adminCreateFamilyAction(_prev: unknown, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false as const, error: "Not authorized" };
  }

  const parsed = createFamilySchema.safeParse({
    parentName: formData.get("parentName"),
    parentEmail: formData.get("parentEmail"),
    password: formData.get("password"),
    studentName: formData.get("studentName"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid form" };
  }

  const email = parsed.data.parentEmail.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "Email already registered" };
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.parentName,
          email,
          passwordHash,
          role: UserRole.PARENT,
          status: UserStatus.ACTIVE,
        },
      });
      const parent = await tx.parentProfile.create({
        data: {
          userId: user.id,
          billingEmail: email,
        },
      });
      const student = await tx.student.create({
        data: {
          displayName: parsed.data.studentName,
        },
      });
      await tx.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: student.id,
          relation: "parent",
        },
      });
    });
    revalidatePath("/admin/students");
    revalidatePath("/admin/parents");
    return { ok: true as const, error: null as string | null };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not create family" };
  }
}

export async function adminCreateInviteAction(_prev: unknown, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { ok: false as const, error: "Not authorized", inviteUrl: null as string | null };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Valid email required", inviteUrl: null };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "User already exists", inviteUrl: null };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: {
      email,
      name: name || email,
      role: UserRole.PARENT,
      status: UserStatus.INVITED,
      inviteToken: token,
      inviteExpiresAt: expires,
    },
  });

  const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${base.replace(/\/$/, "")}/invite/${token}`;
  revalidatePath("/admin/students");
  revalidatePath("/admin/parents");
  return { ok: true as const, error: null, inviteUrl };
}

export async function adminCancelBookingAction(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status === BookingStatus.CANCELLED) return;

  await prisma.$transaction(async (tx) => {
    await cancelBookingInTransaction(tx, bookingId);
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}/edit`);
  revalidatePath("/students/bookings");
}

export async function adminMarkPaymentPaidAction(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === PaymentStatus.PAID) return;

  const { completePendingPayment } = await import("@/server/payments/complete-pending-payment");
  await completePendingPayment(paymentId, payment.payerId);

  revalidatePath("/admin/payments");
  revalidatePath("/students/payments");
  revalidatePath("/students/bookings");
}
