import { sendEmailViaResend } from "@/lib/integrations/reminders/resend-email";

function appBaseUrl() {
  return (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://jomngaji.my").replace(/\/$/, "");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailLayout(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#faf8f3;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
          <tr><td>
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#c5a059;">jomngaji.my</p>
            ${body}
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendRegistrationWelcomeEmail(params: {
  to: string;
  name: string;
  accountType: "student" | "parent";
  learnerName: string;
}) {
  const name = escapeHtml(params.name.trim());
  const learnerName = escapeHtml(params.learnerName.trim());
  const loginUrl = `${appBaseUrl()}/login?callbackUrl=%2Fstudents`;
  const isParent = params.accountType === "parent";

  const intro = isParent
    ? `Your family account is ready. You can book classes and manage progress for <strong>${learnerName}</strong> from your learning portal.`
    : "Your learner account is ready. You can book classes, track progress, and join live sessions from your learning portal.";

  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Welcome to jomngaji.my</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi ${name},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${intro}</p>
    <p style="margin:0 0 24px;">
      <a href="${loginUrl}" style="display:inline-block;background:#c5a059;color:#0f172a;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;">Sign in to your portal</a>
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">Sign in with the email you used to register: <strong>${escapeHtml(params.to)}</strong></p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">— The jomngaji.my team</p>
  `);

  const ok = await sendEmailViaResend(params.to, "jomngaji.my — welcome to your learning portal", html);
  if (!ok) {
    console.warn("registration welcome email not sent", { to: params.to });
  }
  return ok;
}
