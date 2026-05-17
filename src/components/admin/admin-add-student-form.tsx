"use client";

import { useActionState } from "react";
import {
  adminAddStudentToParentAction,
  adminUserFormInitial,
  type AdminUserFormState,
} from "@/app/actions/admin-users";

type Props = { parentUserId: string };

export function AdminAddStudentForm({ parentUserId }: Props) {
  const [state, formAction, pending] = useActionState(adminAddStudentToParentAction, adminUserFormInitial);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="parentUserId" value={parentUserId} />
      {state?.ok ? (
        <p className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:col-span-2">
          Student added and linked to this parent.
        </p>
      ) : null}
      {state?.error ? (
        <p className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.error}
        </p>
      ) : null}
      <label className="flex-1 text-sm">
        <span className="mb-1 block font-medium">Child name</span>
        <input name="studentName" required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add student"}
      </button>
    </form>
  );
}
