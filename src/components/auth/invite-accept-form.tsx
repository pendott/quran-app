"use client";

import { useActionState } from "react";
import { acceptInviteAction } from "@/app/actions/invite";

type Props = { token: string; defaultName: string };

export function InviteAcceptForm({ token, defaultName }: Props) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, {
    ok: false,
    error: null as string | null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Your name</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Child&apos;s name</span>
        <input name="studentName" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
