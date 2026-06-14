"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type PasswordResetState } from "@/app/actions/password-reset";

const initial: PasswordResetState = { ok: false, error: null, message: null };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state?.message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{state.message}</p>
      ) : null}
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 disabled:opacity-50">
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-[#0d4f4f] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
