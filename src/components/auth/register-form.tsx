"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { registerAccountAction, type RegisterState } from "@/app/actions/register";

const initial: RegisterState = { ok: false, error: null };

export function RegisterForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"student" | "parent">("student");
  const [state, formAction, pending] = useActionState(registerAccountAction, initial);

  useEffect(() => {
    if (state?.ok) {
      router.push("/login?registered=1&callbackUrl=%2Fstudents");
    }
  }, [state, router]);

  const err = state && !state.ok && state.error ? state.error : null;

  return (
    <form action={formAction} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-800">I am signing up as</legend>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm has-[:checked]:border-[#0d4f4f] has-[:checked]:bg-[#0d4f4f]/5">
          <input
            type="radio"
            name="accountType"
            value="student"
            checked={accountType === "student"}
            onChange={() => setAccountType("student")}
          />
          <span>
            <span className="block font-semibold text-slate-900">Learner</span>
            <span className="text-slate-600">I will book and join classes myself</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm has-[:checked]:border-[#0d4f4f] has-[:checked]:bg-[#0d4f4f]/5">
          <input
            type="radio"
            name="accountType"
            value="parent"
            checked={accountType === "parent"}
            onChange={() => setAccountType("parent")}
          />
          <span>
            <span className="block font-semibold text-slate-900">Parent / guardian</span>
            <span className="text-slate-600">I will manage classes for my child</span>
          </span>
        </label>
      </fieldset>

      {err ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Your full name</span>
        <input name="name" required autoComplete="name" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>

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

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          {accountType === "parent" ? "Learner name (your child)" : "Display name for classes"}
        </span>
        <input
          name="learnerName"
          required={accountType === "parent"}
          placeholder={accountType === "student" ? "Same as your name is fine" : "e.g. Aisyah"}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <button type="submit" disabled={pending} className="w-full btn-primary py-3 disabled:opacity-50">
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#0d4f4f] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
