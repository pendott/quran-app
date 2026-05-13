import { PaymentStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MockMalaysiaCheckoutWizard } from "@/components/payments/mock-malaysia-checkout-wizard";

type Props = { params: Promise<{ paymentId: string }> };

export default async function MockCheckoutPage({ params }: Props) {
  const { paymentId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/checkout/mock/${paymentId}`)}`);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { student: true },
  });
  if (!payment || payment.payerId !== session.user.id) notFound();
  if (payment.status !== PaymentStatus.PENDING) {
    redirect("/students/payments");
  }

  const meta = payment.metadata as { packageId?: string; packageName?: string } | null;
  const pkg =
    meta?.packageId != null
      ? await prisma.package.findUnique({ where: { id: meta.packageId } })
      : null;
  const packageName = (meta?.packageName as string) || pkg?.name || "Package";

  return (
    <MockMalaysiaCheckoutWizard
      paymentId={payment.id}
      billReference={payment.checkoutReference ?? payment.id}
      packageName={packageName}
      studentName={payment.student.displayName}
      amount={payment.amount}
    />
  );
}
