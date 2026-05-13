import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function csvEscape(value: string) {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    take: 500,
    orderBy: { scheduledStartAt: "desc" },
    include: {
      student: true,
      teacher: { include: { user: true } },
    },
  });

  const header = ["id", "scheduledStartAt", "scheduledEndAt", "status", "student", "teacherEmail", "amountDue", "currency"].join(
    ",",
  );
  const lines = bookings.map((b) =>
    [
      b.id,
      b.scheduledStartAt.toISOString(),
      b.scheduledEndAt.toISOString(),
      b.status,
      b.student.displayName,
      b.teacher.user.email,
      b.amountDue.toString(),
      b.currency,
    ]
      .map((c) => csvEscape(String(c)))
      .join(","),
  );

  const csv = [header, ...lines].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bookings-export.csv"',
    },
  });
}
