"use client";

import { useActionState } from "react";
import {
  adminCreateTeacherAction,
  adminUserFormInitial,
  type AdminUserFormState,
} from "@/app/actions/admin-users";

export function AdminCreateTeacherForm() {
  const [state, formAction, pending] = useActionState(adminCreateTeacherAction, adminUserFormInitial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <FormMessages state={state} />
      <label className="text-sm">
        <span className="mb-1 block font-medium">Full name</span>
        <input name="name" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Email</span>
        <input name="email" type="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Temporary password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Timezone</span>
        <input
          name="timezone"
          defaultValue="Asia/Kuala_Lumpur"
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Headline</span>
        <input name="headline" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Bio</span>
        <textarea name="bio" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input name="isAcceptingBookings" type="checkbox" defaultChecked className="rounded border-slate-300" />
        <span>Accepting new bookings</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 btn-primary disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create teacher account"}
      </button>
    </form>
  );
}

function FormMessages({ state }: { state: AdminUserFormState }) {
  return (
    <>
      {state?.ok ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Teacher created. They can sign in immediately.
        </p>
      ) : null}
      {state?.error ? (
        <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.error}
        </p>
      ) : null}
    </>
  );
}
