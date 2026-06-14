import { prisma } from "@/lib/db";
import { clearUserFinancialRecords } from "@/server/admin/delete-class-data";

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
      await clearUserFinancialRecords(tx, userId);
      await tx.user.delete({ where: { id: userId } });
    });

    return { ok: true };
  } catch (e) {
    console.error("deleteParentAccount failed", e);
    return { ok: false, error: "Could not delete parent" };
  }
}
