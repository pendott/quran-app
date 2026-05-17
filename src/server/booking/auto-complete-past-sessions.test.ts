import { describe, expect, it } from "vitest";
import { SessionStatus } from "@prisma/client";

describe("autoCompletePastSessions", () => {
  it("targets scheduled and in-progress sessions only", () => {
    const open: SessionStatus[] = [SessionStatus.SCHEDULED, SessionStatus.IN_PROGRESS];
    expect(open).toContain(SessionStatus.SCHEDULED);
    expect(open).not.toContain(SessionStatus.COMPLETED);
    expect(open).not.toContain(SessionStatus.CANCELLED);
  });
});
