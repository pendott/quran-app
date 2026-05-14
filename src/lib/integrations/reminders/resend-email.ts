/**
 * Optional Resend transport (no extra npm package — uses REST API).
 * Set RESEND_API_KEY and RESEND_FROM (verified sender, e.g. "Quran Class <mail@yourdomain>").
 */
export async function sendEmailViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM ?? "Quran Class <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}
