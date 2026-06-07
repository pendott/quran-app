"use client";

import { useActionState } from "react";
import { resetPasswordAction, type PasswordResetState } from "@/app/actions/password-reset";

const initial: PasswordResetState = { ok: false, error: null, message: null };

type Props = { token: string };

export function ResetPasswordForm({ token }: Props) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">New password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-50">
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
