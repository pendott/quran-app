"use client";

import { useActionState } from "react";
import { saveClassNoteAction } from "@/app/actions/class-note";

type Props = {
  sessionId: string;
  defaults: {
    lastSurah: string;
    lastAyahFrom: string;
    lastAyahTo: string;
    homework: string;
    nextTarget: string;
    summary: string;
  };
};

export function ClassNoteEditor({ sessionId, defaults }: Props) {
  const [state, formAction, pending] = useActionState(saveClassNoteAction, { ok: false, error: null as string | null });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      {state?.ok ? <p className="text-sm text-emerald-700">Note saved.</p> : null}
      {state && "error" in state && state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="lastSurah" label="Last surah" defaultValue={defaults.lastSurah} />
        <Field name="lastAyahFrom" label="Ayah from" defaultValue={defaults.lastAyahFrom} />
        <Field name="lastAyahTo" label="Ayah to" defaultValue={defaults.lastAyahTo} />
        <Field name="nextTarget" label="Next target" defaultValue={defaults.nextTarget} />
      </div>
      <Field name="homework" label="Homework" defaultValue={defaults.homework} multiline />
      <Field name="summary" label="Class summary" defaultValue={defaults.summary} multiline />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save note"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  multiline,
}: {
  name: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          rows={3}
          defaultValue={defaultValue}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      ) : (
        <input name={name} defaultValue={defaultValue} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
      )}
    </label>
  );
}
