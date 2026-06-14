import { prisma } from "@/lib/db";
import {
  deleteBookings,
  deleteClassSessions,
  deletePackagePurchases,
} from "@/server/admin/delete-class-data";

export async function deleteStudentRecord(studentId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, userId: true, user: { select: { role: true } } },
  });
  if (!student) return { ok: false, error: "Student not found" };

  try {
    await prisma.$transaction(async (tx) => {
      const bookingIds = (
        await tx.booking.findMany({
          where: { studentId },
          select: { id: true },
        })
      ).map((b) => b.id);
      await deleteBookings(tx, bookingIds);

      const sessionIds = (
        await tx.classSession.findMany({
          where: { studentId },
          select: { id: true },
        })
      ).map((s) => s.id);
      await deleteClassSessions(tx, sessionIds);

      const purchaseIds = (
        await tx.packagePurchase.findMany({
          where: { studentId },
          select: { id: true },
        })
      ).map((p) => p.id);
      await deletePackagePurchases(tx, purchaseIds);

      await tx.payment.deleteMany({ where: { studentId } });
      await tx.classNote.deleteMany({ where: { studentId } });
      await tx.student.delete({ where: { id: studentId } });

      if (student.userId && student.user?.role === "STUDENT") {
        await tx.user.delete({ where: { id: student.userId } });
      }
    });

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not delete student" };
  }
}
