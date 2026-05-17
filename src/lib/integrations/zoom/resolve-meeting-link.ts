import type { MeetingProvider, Prisma } from "@prisma/client";
import { createZoomMeeting } from "@/lib/integrations/zoom/client";
import { isZoomConfigured, isZoomStubMode } from "@/lib/integrations/zoom/config";
import { createZoomMeetingStub } from "@/lib/integrations/zoom/stub";

export type ResolvedMeetingLink = {
  provider: MeetingProvider;
  joinUrl: string;
  externalMeetingId: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function resolveMeetingLinkForClass(input: {
  topic: string;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  fallbackSessionKey: string;
}): Promise<ResolvedMeetingLink> {
  const durationMinutes = Math.max(
    15,
    Math.round((input.scheduledEndAt.getTime() - input.scheduledStartAt.getTime()) / 60_000) || 60,
  );

  if (isZoomStubMode()) {
    const stub = createZoomMeetingStub(input.topic);
    return {
      provider: "ZOOM",
      joinUrl: stub.joinUrl,
      externalMeetingId: stub.meetingId,
      metadata: { stub: true },
    };
  }

  if (isZoomConfigured()) {
    const zoom = await createZoomMeeting({
      topic: input.topic,
      scheduledStartAt: input.scheduledStartAt,
      durationMinutes,
    });
    if (zoom.ok) {
      return {
        provider: "ZOOM",
        joinUrl: zoom.joinUrl,
        externalMeetingId: zoom.meetingId,
        metadata: { zoom: true },
      };
    }
    console.error("zoom_fallback_manual", zoom.error);
  }

  return {
    provider: "MANUAL",
    joinUrl: `https://meet.quran-class.local/${input.fallbackSessionKey}`,
    externalMeetingId: null,
  };
}
