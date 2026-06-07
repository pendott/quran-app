"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { resolvePostLoginPath } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered") === "1";
  const reset = searchParams.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    let session = await getSession();
    if (!session?.user?.role) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      session = await getSession();
    }

    const role = (session?.user?.role as UserRole | undefined) ?? "STUDENT";
    const next = resolvePostLoginPath(callbackUrl, role);
    // Full page load so middleware and server layouts see the session cookie.
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {registered ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Account created. Sign in with your email and password.
        </p>
      ) : null}
      {reset ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Password updated. Sign in with your new password.
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs font-semibold text-[#0d4f4f] hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full py-3 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-xs leading-5 text-slate-500">
        After sign-in you are redirected by role. Demo (from seed):{" "}
        <code className="rounded bg-slate-100 px-1">admin@demo.local</code>,{" "}
        <code className="rounded bg-slate-100 px-1">teacher@demo.local</code>,{" "}
        <code className="rounded bg-slate-100 px-1">parent@demo.local</code>,{" "}
        <code className="rounded bg-slate-100 px-1">student@demo.local</code> — password{" "}
        <code className="rounded bg-slate-100 px-1">DevPass123!</code>
      </p>
    </form>
  );
}
