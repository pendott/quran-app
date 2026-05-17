import { NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/integrations/reminders/dispatch";
import { autoCompletePastSessions } from "@/server/booking/auto-complete-past-sessions";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

/** Vercel / external cron: set CRON_SECRET and call with Authorization: Bearer <secret>. */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [reminders, sessions] = await Promise.all([
    dispatchDueReminders(),
    autoCompletePastSessions(),
  ]);
  return NextResponse.json({ reminders, sessions });
}

export const POST = GET;
