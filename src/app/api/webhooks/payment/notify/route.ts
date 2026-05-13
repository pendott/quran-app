import { NextResponse } from "next/server";

/** Placeholder for Billplz / ToyyibPay / SenangPay / Stripe webhooks. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ received: true, echo: body }, { status: 200 });
}
