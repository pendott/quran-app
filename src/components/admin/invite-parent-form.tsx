"use client";

import { useActionState } from "react";
import { adminCreateInviteAction } from "@/app/actions/admin";

export function InviteParentForm() {
  const [state, formAction, pending] = useActionState(adminCreateInviteAction, {
    ok: false,
    error: null as string | null,
    inviteUrl: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-3">
      {state?.ok && state.inviteUrl ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Invite link (valid 7 days):{" "}
          <a href={state.inviteUrl} className="break-all font-medium underline">
            {state.inviteUrl}
          </a>
        </p>
      ) : null}
      {state?.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input name="email" type="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Name (optional)</span>
          <input name="name" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Generating…" : "Generate invite link"}
      </button>
    </form>
  );
}
