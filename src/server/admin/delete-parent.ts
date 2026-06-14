import { prisma } from "@/lib/db";
import { deleteBookings, deletePackagePurchases } from "@/server/admin/delete-class-data";

export async function deleteParentAccount(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { parentProfile: true },
  });
  if (!user || user.role !== "PARENT" || !user.parentProfile) {
    return { ok: false, error: "Parent not found" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const bookingIds = (
        await tx.booking.findMany({
          where: { bookedById: userId },
          select: { id: true },
        })
      ).map((b) => b.id);
      await deleteBookings(tx, bookingIds);

      const purchaseIds = (
        await tx.packagePurchase.findMany({
          where: { purchasedById: userId },
          select: { id: true },
        })
      ).map((p) => p.id);
      await deletePackagePurchases(tx, purchaseIds);

      await tx.payment.deleteMany({ where: { payerId: userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete parent" };
  }
}
