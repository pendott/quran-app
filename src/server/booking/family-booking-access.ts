import { prisma } from "@/lib/db";
import { getFamilyStudentIds } from "@/server/queries/family";
import type { UserRole } from "@/lib/types";

export async function assertFamilyCanManageBooking(
  userId: string,
  role: UserRole,
  bookingId: string,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: true,
      teacher: { include: { user: true } },
      classSession: { include: { meetingLink: true } },
      creditUsage: true,
    },
  });
  if (!booking) {
    return { ok: false as const, error: "Booking not found" };
  }

  const allowedStudentIds = await getFamilyStudentIds(userId, role);
  if (!allowedStudentIds.includes(booking.studentId)) {
    return { ok: false as const, error: "Not authorized to manage this booking" };
  }

  return { ok: true as const, booking };
}
