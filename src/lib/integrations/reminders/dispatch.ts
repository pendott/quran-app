import { prisma } from "@/lib/db";
import { sendEmailViaResend } from "@/lib/integrations/reminders/resend-email";

/**
 * Sends due reminders (Resend when RESEND_API_KEY is set; otherwise marks SENT as stub for cron demos).
 * Cron: `GET /api/cron/reminders` with `Authorization: Bearer $CRON_SECRET`.
 */
export async function dispatchDueReminders(limit = 30) {
  const now = new Date();
  const due = await prisma.reminder.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: now } },
    orderBy: { scheduledFor: "asc" },
    take: limit,
    include: { recipientUser: true },
  });

  let sent = 0;
  let failed = 0;

  for (const r of due) {
    try {
      const email = r.recipientUser.email;
      const useResend = !!process.env.RESEND_API_KEY && r.channel === "EMAIL" && !!email;

      if (useResend) {
        const ok = await sendEmailViaResend(
          email,
          `Quran Class — ${r.templateKey.replace(/_/g, " ")}`,
          `<p>You have an upcoming reminder.</p><p><strong>${r.templateKey}</strong></p>`,
        );
        if (!ok) {
          await prisma.reminder.update({
            where: { id: r.id },
            data: { status: "FAILED" },
          });
          failed += 1;
          continue;
        }
      }

      await prisma.reminder.update({
        where: { id: r.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          externalMessageId: useResend ? `resend-${r.id}` : `stub-${r.id}`,
          metadata: { channel: r.channel, templateKey: r.templateKey, transport: useResend ? "resend" : "stub" },
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
