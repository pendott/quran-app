import { prisma } from "@/lib/db";
import {
  clearUserFinancialRecords,
  deleteBookings,
  deleteClassSessions,
} from "@/server/admin/delete-class-data";

function deleteErrorMessage(e: unknown) {
  if (e && typeof e === "object" && "code" in e) {
    if (e.code === "P2003") {
      return "Cannot delete teacher — related bookings or payments still exist. Try again or contact support.";
    }
    if (e.code === "P2025") {
      return "Teacher not found or already deleted.";
    }
  }
  if (e instanceof Error && e.message.trim()) {
    return e.message;
  }
  return "Could not delete teacher";
}

export async function deleteTeacherAccount(teacherId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true, userId: true, user: { select: { role: true } } },
  });
  if (!teacher) return { ok: false, error: "Teacher not found" };
  if (!teacher.user) return { ok: false, error: "Teacher login account not found" };
  if (teacher.user.role !== "TEACHER") return { ok: false, error: "User is not a teacher" };

  const userId = teacher.userId;

  try {
    await prisma.$transaction(async (tx) => {
      const bookingIds = (
        await tx.booking.findMany({
          where: { teacherId },
          select: { id: true },
        })
      ).map((b) => b.id);
      await deleteBookings(tx, bookingIds);

      const remainingSessionIds = (
        await tx.classSession.findMany({
          where: { teacherId },
          select: { id: true },
        })
      ).map((s) => s.id);
      await deleteClassSessions(tx, remainingSessionIds);

      await tx.classNote.deleteMany({ where: { teacherId } });
      await tx.studentTeacherAssignment.deleteMany({ where: { teacherId } });
      await tx.teacherAvailability.deleteMany({ where: { teacherId } });
      await tx.teacherApplication.updateMany({
        where: { createdTeacherId: teacherId },
        data: { createdTeacherId: null },
      });
      await tx.reminder.deleteMany({ where: { recipientUserId: userId } });
      await clearUserFinancialRecords(tx, userId);
      await tx.teacher.delete({ where: { id: teacherId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return { ok: true };
  } catch (e) {
    console.error("deleteTeacherAccount failed", e);
    return { ok: false, error: deleteErrorMessage(e) };
  }
}
