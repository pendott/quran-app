/**
 * Placeholder for Zoom Server-to-Server OAuth + meetings API.
 * Returns a synthetic join URL for local development and tests.
 */
export function createZoomMeetingStub(topic: string) {
  const slug = topic.trim().slice(0, 40) || "class";
  return {
    meetingId: `zoom_stub_${Date.now()}`,
    joinUrl: `https://example.invalid/zoom-stub?topic=${encodeURIComponent(slug)}`,
  };
}
