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

async function sendApplicantEmail(to: string, subject: string, html: string) {
  const ok = await sendEmailViaResend(to, subject, html);
  if (!ok) {
    console.warn("teacher-application email not sent", { to, subject });
  }
  return ok;
}

export async function sendTeacherApplicationReceivedEmail(params: { to: string; name: string }) {
  const name = escapeHtml(params.name.trim());
  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">We received your application</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi ${name},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Thank you for applying to teach on jomngaji.my. Our team will review your profile and documents.
      We will email you again once a decision has been made.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">— The jomngaji.my team</p>
  `);
  return sendApplicantEmail(params.to, "jomngaji.my — teacher application received", html);
}

export async function sendTeacherApplicationApprovedEmail(params: { to: string; name: string }) {
  const name = escapeHtml(params.name.trim());
  const loginUrl = `${appBaseUrl()}/login`;
  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Your teacher application is approved</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi ${name},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Welcome aboard! Your jomngaji.my teacher account is ready. Sign in with the email address you applied with
      and the password our team shared with you separately.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${loginUrl}" style="display:inline-block;background:#c5a059;color:#0f172a;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;">Sign in to your dashboard</a>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">If you have not received your login password yet, reply to this email and we will help.</p>
  `);
  return sendApplicantEmail(params.to, "jomngaji.my — teacher application approved", html);
}

export async function sendTeacherApplicationRejectedEmail(params: {
  to: string;
  name: string;
  rejectionReason?: string | null;
}) {
  const name = escapeHtml(params.name.trim());
  const reasonBlock = params.rejectionReason?.trim()
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;"><strong>Note from our team:</strong> ${escapeHtml(params.rejectionReason.trim())}</p>`
    : "";
  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Update on your teacher application</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi ${name},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Thank you for your interest in teaching on jomngaji.my. After reviewing your application, we are unable to
      approve it at this time.
    </p>
    ${reasonBlock}
    <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">We appreciate the time you took to apply.</p>
  `);
  return sendApplicantEmail(params.to, "jomngaji.my — teacher application update", html);
}
