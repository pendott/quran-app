import { sendEmailViaResend } from "@/lib/integrations/reminders/resend-email";

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

export async function sendPasswordResetEmail(params: { to: string; name: string; resetUrl: string }) {
  const name = escapeHtml(params.name.trim());
  const resetUrl = escapeHtml(params.resetUrl);
  const html = emailLayout(`
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hi ${name},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      We received a request to reset your jomngaji.my password. This link expires in one hour.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background:#c5a059;color:#0f172a;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px;">Choose a new password</a>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
      If you did not request this, you can ignore this email. Your password will stay the same.
    </p>
  `);

  const ok = await sendEmailViaResend(params.to, "jomngaji.my — reset your password", html);
  if (!ok) {
    console.warn("password reset email not sent", { to: params.to });
  }
  return ok;
}
