import { prisma } from "@/lib/db";

/**
 * Marks due reminders as sent (stub transport — no email/WhatsApp).
 * Wire to Resend / WhatsApp Cloud API later. Intended for cron: `GET /api/cron/reminders` with `Authorization: Bearer $CRON_SECRET`.
 */
export async function dispatchDueReminders(limit = 30) {
  const now = new Date();
  const due = await prisma.reminder.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: now } },
    orderBy: { scheduledFor: "asc" },
    take: limit,
  });

  let sent = 0;
  let failed = 0;

  for (const r of due) {
    try {
      await prisma.reminder.update({
        where: { id: r.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          externalMessageId: `stub-${r.id}`,
          metadata: { stub: true, channel: r.channel, templateKey: r.templateKey },
        },
      });
      sent += 1;
    } catch {
      await prisma.reminder.update({
        where: { id: r.id },
        data: { status: "FAILED" },
      });
      failed += 1;
    }
  }

  return { scanned: due.length, sent, failed };
}
