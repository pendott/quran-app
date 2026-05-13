"use client";

import { useActionState } from "react";
import { saveSessionRecordingAction } from "@/app/actions/recording";

type Props = {
  sessionId: string;
  defaults: {
    title: string;
    playbackUrl: string;
    durationSeconds: string;
    visibleToFamily: boolean;
  };
};

export function RecordingEditor({ sessionId, defaults }: Props) {
  const [state, formAction, pending] = useActionState(saveSessionRecordingAction, {
    ok: false,
    error: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      {state?.ok ? <p className="text-sm text-emerald-700">Recording saved.</p> : null}
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Title</span>
        <input
          name="title"
          required
          defaultValue={defaults.title}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Playback URL</span>
        <input
          name="playbackUrl"
          type="url"
          placeholder="https://…"
          defaultValue={defaults.playbackUrl}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Duration (seconds)</span>
        <input
          name="durationSeconds"
          type="number"
          min={0}
          defaultValue={defaults.durationSeconds}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="visibleToFamily" defaultChecked={defaults.visibleToFamily} className="rounded" />
        <span>Visible to family</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save recording"}
      </button>
    </form>
  );
}
