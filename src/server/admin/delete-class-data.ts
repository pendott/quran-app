import type { Prisma } from "@prisma/client";

export type Tx = Prisma.TransactionClient;

export async function deleteClassSessions(tx: Tx, sessionIds: string[]) {
  if (!sessionIds.length) return;
  await tx.classNote.deleteMany({ where: { classSessionId: { in: sessionIds } } });
  await tx.recording.deleteMany({ where: { classSessionId: { in: sessionIds } } });
  await tx.meetingLink.deleteMany({ where: { classSessionId: { in: sessionIds } } });
  await tx.reminder.deleteMany({ where: { classSessionId: { in: sessionIds } } });
  await tx.classSession.deleteMany({ where: { id: { in: sessionIds } } });
}

export async function deleteBookings(tx: Tx, bookingIds: string[]) {
  if (!bookingIds.length) return;

  const sessionIds = (
    await tx.classSession.findMany({
      where: { bookingId: { in: bookingIds } },
      select: { id: true },
    })
  ).map((s) => s.id);

  await deleteClassSessions(tx, sessionIds);
  await tx.reminder.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await tx.packageCreditUsage.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await tx.payment.updateMany({
    where: { bookingId: { in: bookingIds } },
    data: { bookingId: null },
  });
  await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
}

export async function deletePackagePurchases(tx: Tx, purchaseIds: string[]) {
  if (!purchaseIds.length) return;

  const purchaseBookingIds = (
    await tx.booking.findMany({
      where: { packagePurchaseId: { in: purchaseIds } },
      select: { id: true },
    })
  ).map((b) => b.id);
  await deleteBookings(tx, purchaseBookingIds);
  await tx.packageCreditUsage.deleteMany({ where: { packagePurchaseId: { in: purchaseIds } } });
  await tx.payment.deleteMany({ where: { packagePurchaseId: { in: purchaseIds } } });
  await tx.packagePurchase.deleteMany({ where: { id: { in: purchaseIds } } });
}
