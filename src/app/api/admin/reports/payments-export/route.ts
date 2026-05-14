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

  const payments = await prisma.payment.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      student: true,
      payer: true,
      packagePurchase: { include: { package: true } },
    },
  });

  const header = ["id", "createdAt", "status", "amount", "currency", "provider", "student", "payerEmail", "purpose"].join(
    ",",
  );
  const lines = payments.map((p) => {
    const purpose = p.packagePurchase?.package.name ?? (p.bookingId ? `booking:${p.bookingId.slice(0, 8)}` : "—");
    return [
      p.id,
      p.createdAt.toISOString(),
      p.status,
      p.amount.toString(),
      p.currency,
      p.provider,
      p.student.displayName,
      p.payer.email,
      purpose,
    ]
      .map((c) => csvEscape(String(c)))
      .join(",");
  });

  const csv = [header, ...lines].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="payments-export.csv"',
    },
  });
}
