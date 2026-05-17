import { isZoomConfigured } from "@/lib/integrations/zoom/config";

type ZoomTokenResponse = {
  access_token: string;
  expires_in: number;
};

type ZoomMeetingResponse = {
  id: number;
  join_url: string;
};

let cachedToken: { value: string; expiresAtMs: number } | null = null;

async function getZoomAccessToken(): Promise<string | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) return null;

  if (cachedToken && cachedToken.expiresAtMs > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("zoom_token_error", res.status, body);
    return null;
  }

  const data = (await res.json()) as ZoomTokenResponse;
  cachedToken = {
    value: data.access_token,
    expiresAtMs: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export type CreateZoomMeetingInput = {
  topic: string;
  scheduledStartAt: Date;
  durationMinutes: number;
  timezone?: string;
};

export type CreateZoomMeetingResult =
  | { ok: true; meetingId: string; joinUrl: string }
  | { ok: false; error: string };

/**
 * Creates a scheduled Zoom meeting for the configured host user.
 * @see https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
 */
export async function createZoomMeeting(input: CreateZoomMeetingInput): Promise<CreateZoomMeetingResult> {
  if (!isZoomConfigured()) {
    return { ok: false, error: "Zoom is not configured" };
  }

  const hostUserId = process.env.ZOOM_HOST_USER_ID!;
  const token = await getZoomAccessToken();
  if (!token) {
    return { ok: false, error: "Could not obtain Zoom access token" };
  }

  const start = input.scheduledStartAt;
  const startTime = start.toISOString().replace(/\.\d{3}Z$/, "Z");

  const res = await fetch(
    `https://api.zoom.us/v2/users/${encodeURIComponent(hostUserId)}/meetings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: input.topic.slice(0, 200),
        type: 2,
        start_time: startTime,
        duration: input.durationMinutes,
        timezone: input.timezone ?? "Asia/Kuala_Lumpur",
        settings: {
          join_before_host: true,
          waiting_room: false,
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("zoom_meeting_error", res.status, body);
    return { ok: false, error: `Zoom API error (${res.status})` };
  }

  const data = (await res.json()) as ZoomMeetingResponse;
  return {
    ok: true,
    meetingId: String(data.id),
    joinUrl: data.join_url,
  };
}
