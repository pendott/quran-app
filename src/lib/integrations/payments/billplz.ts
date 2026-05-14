/**
 * Billplz API v3 (sandbox or live). Set BILLPLZ_API_KEY, BILLPLZ_COLLECTION_ID, AUTH_URL (or NEXTAUTH_URL).
 * @see https://www.billplz.com/api
 */
export type BillplzCreateBillResult =
  | { ok: true; billId: string; billUrl: string }
  | { ok: false; error: string };

export async function createBillplzBill(input: {
  title: string;
  amountMYR: number;
  email: string;
  name: string;
  /** Shown in Billplz dashboard; use internal payment id for correlation. */
  reference1: string;
}): Promise<BillplzCreateBillResult> {
  const apiKey = process.env.BILLPLZ_API_KEY;
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;
  const base =
    process.env.BILLPLZ_API_BASE_URL ??
    (process.env.BILLPLZ_SANDBOX === "0" ? "https://www.billplz.com/api/v3" : "https://www.billplz-sandbox.com/api/v3");

  if (!apiKey || !collectionId) {
    return { ok: false, error: "Set BILLPLZ_API_KEY and BILLPLZ_COLLECTION_ID to use Billplz." };
  }

  const callbackBase = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const callbackUrl = `${callbackBase.replace(/\/$/, "")}/api/webhooks/payment/notify`;
  const redirectUrl = `${callbackBase.replace(/\/$/, "")}/students/payments`;

  const amountSen = Math.round(Number(input.amountMYR) * 100);
  if (!Number.isFinite(amountSen) || amountSen < 1) {
    return { ok: false, error: "Invalid amount for Billplz bill." };
  }

  const body = new URLSearchParams();
  body.set("collection_id", collectionId);
  body.set("description", input.title.slice(0, 200));
  body.set("email", input.email);
  body.set("name", input.name.slice(0, 100));
  body.set("amount", String(amountSen));
  body.set("callback_url", callbackUrl);
  body.set("redirect_url", redirectUrl);
  body.set("reference_1", input.reference1.slice(0, 120));

  const auth = Buffer.from(`${apiKey}:`, "utf8").toString("base64");

  try {
    const res = await fetch(`${base}/bills`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const json = (await res.json().catch(() => null)) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok) {
      const msg = json?.error?.message ?? res.statusText;
      return { ok: false, error: `Billplz error: ${msg}` };
    }
    if (!json?.id || !json?.url) {
      return { ok: false, error: "Billplz returned an unexpected response." };
    }
    return { ok: true, billId: json.id, billUrl: json.url };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not reach Billplz API." };
  }
}
