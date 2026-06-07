import { prisma } from "@/lib/db";
import { assertFamilyCanManageBooking } from "@/server/booking/family-booking-access";
import type { UserRole } from "@/lib/types";

export async function getFamilyBookingForEdit(userId: string, role: UserRole, bookingId: string) {
  const access = await assertFamilyCanManageBooking(userId, role, bookingId);
  if (!access.ok) return null;
  return access.booking;
}

export async function getFamilyBookingManageContext(userId: string, role: UserRole, bookingId: string) {
  const booking = await getFamilyBookingForEdit(userId, role, bookingId);
  if (!booking) return null;

  const teachers = await prisma.teacher.findMany({
    where: { isAcceptingBookings: true },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return {
    booking,
    teachers: teachers.map((t) => ({
      id: t.id,
      name: t.user.name ?? t.user.email,
    })),
  };
}
