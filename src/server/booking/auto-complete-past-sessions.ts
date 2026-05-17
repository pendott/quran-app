import { AttendanceStatus, BookingStatus, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const OPEN_SESSION_STATUSES: SessionStatus[] = [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS];

/**
 * Mark class sessions past their scheduled end as completed (and linked confirmed bookings).
 */
export async function autoCompletePastSessions(options?: { teacherId?: string }) {
  const now = new Date();
  const sessions = await prisma.classSession.findMany({
    where: {
      ...(options?.teacherId ? { teacherId: options.teacherId } : {}),
      scheduledEndAt: { lt: now },
      status: { in: OPEN_SESSION_STATUSES },
    },
    include: { booking: { select: { id: true, status: true } } },
  });

  if (!sessions.length) {
    return { completed: 0 };
  }

  await prisma.$transaction(async (tx) => {
    for (const cs of sessions) {
      await tx.classSession.update({
        where: { id: cs.id },
        data: {
          status: SessionStatus.COMPLETED,
          completedAt: now,
          actualEndAt: cs.actualEndAt ?? cs.scheduledEndAt,
          teacherAttendance:
            cs.teacherAttendance === AttendanceStatus.PENDING
              ? AttendanceStatus.PRESENT
              : cs.teacherAttendance,
          studentAttendance:
            cs.studentAttendance === AttendanceStatus.PENDING
              ? AttendanceStatus.PRESENT
              : cs.studentAttendance,
        },
      });

      if (cs.booking?.status === BookingStatus.CONFIRMED) {
        await tx.booking.update({
          where: { id: cs.booking.id },
          data: { status: BookingStatus.COMPLETED },
        });
      }
    }
  });

  return { completed: sessions.length };
}

export async function autoCompletePastSessionsForTeacher(teacherId: string) {
  return autoCompletePastSessions({ teacherId });
}
