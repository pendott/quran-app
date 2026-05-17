import type { MeetingProvider } from "@prisma/client";
import { createElement, type ReactNode } from "react";

type Props = {
  joinUrl?: string | null;
  provider?: MeetingProvider | null;
  /** Shown when there is no join URL yet */
  pendingReason?: string;
};

export function MeetingJoinLink({ joinUrl, provider, pendingReason }: Props) {
  if (!joinUrl) {
    return <span className="text-xs leading-relaxed text-slate-500">{pendingReason ?? "No link yet"}</span>;
  }

  const isZoom = provider === "ZOOM" || /zoom\.us/i.test(joinUrl);

  return (
    <div className="space-y-1">
      <span
        className={
          isZoom
            ? "inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800"
            : "inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
        }
      >
        {isZoom ? "Zoom ready" : provider === "MANUAL" ? "Manual link" : "Meeting"}
      </span>
      <a
        href={joinUrl}
        target="_blank"
        rel="noreferrer"
        className="block max-w-[240px] truncate text-sm font-semibold text-teal-700 underline decoration-teal-700/30 hover:text-teal-600"
        title={joinUrl}
      >
        Join meeting
      </a>
    </div>
  );
}

/** For server-side DataTable rows */
export function meetingJoinLinkCell(
  joinUrl: string | null | undefined,
  provider: MeetingProvider | null | undefined,
  pendingReason?: string,
): ReactNode {
  return createElement(MeetingJoinLink, {
    joinUrl: joinUrl ?? null,
    provider: provider ?? null,
    pendingReason,
  });
}
