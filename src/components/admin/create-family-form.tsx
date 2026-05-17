"use client";

import { useActionState } from "react";
import { adminCreateFamilyAction } from "@/app/actions/admin";

export function CreateFamilyForm() {
  const [state, formAction, pending] = useActionState(adminCreateFamilyAction, {
    ok: false,
    error: null as string | null,
  });

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {state?.ok ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Family account created. They can sign in immediately.
        </p>
      ) : null}
      {state?.error ? (
        <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.error}
        </p>
      ) : null}
      <label className="text-sm">
        <span className="mb-1 block font-medium">Parent name</span>
        <input name="parentName" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Parent email</span>
        <input name="parentEmail" type="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Temporary password</span>
        <input name="password" type="password" required minLength={8} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Student name</span>
        <input name="studentName" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create parent + student"}
      </button>
    </form>
  );
}
