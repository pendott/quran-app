import { prisma } from "@/lib/db";

export type AdminBookingPickerStudent = { id: string; displayName: string };
export type AdminBookingPickerTeacher = { id: string; name: string };

export async function getAdminBookingFormOptions(): Promise<{
  students: AdminBookingPickerStudent[];
  teachers: AdminBookingPickerTeacher[];
  dbError: boolean;
}> {
  try {
    const [students, teachers] = await Promise.all([
      prisma.student.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true },
        orderBy: { displayName: "asc" },
      }),
      prisma.teacher.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      }),
    ]);
    return {
      students,
      teachers: teachers.map((t) => ({
        id: t.id,
        name: t.user.name ?? t.user.email,
      })),
      dbError: false,
    };
  } catch {
    return { students: [], teachers: [], dbError: true };
  }
}

export async function getAdminBookingForEdit(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: true,
      teacher: { include: { user: true } },
      classSession: true,
      pricingRule: true,
      packagePurchase: { include: { package: true } },
    },
  });
}
