"use client";

import { UserStatus } from "@prisma/client";
import { useActionState } from "react";
import {
  adminUpdateParentAction,
  adminUserFormInitial,
  type AdminUserFormState,
} from "@/app/actions/admin-users";
import type { AdminParentForEdit } from "@/server/queries/admin-users";

const statusOptions: { value: UserStatus; label: string }[] = [
  { value: UserStatus.ACTIVE, label: "Active" },
  { value: UserStatus.SUSPENDED, label: "Suspended" },
  { value: UserStatus.INVITED, label: "Invited" },
  { value: UserStatus.ARCHIVED, label: "Archived" },
];

type Props = { parent: AdminParentForEdit };

export function AdminEditParentForm({ parent }: Props) {
  const [state, formAction, pending] = useActionState(adminUpdateParentAction, adminUserFormInitial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="userId" value={parent.userId} />
      <FormMessages state={state} />

      <label className="text-sm">
        <span className="mb-1 block font-medium">Full name</span>
        <input name="name" required defaultValue={parent.name} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Login email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={parent.email}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Account status</span>
        <select name="status" defaultValue={parent.status} className="w-full rounded-xl border border-slate-200 px-3 py-2">
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">New password (optional)</span>
        <input name="newPassword" type="password" minLength={8} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Billing email</span>
        <input
          name="billingEmail"
          type="email"
          defaultValue={parent.billingEmail ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Emergency contact</span>
        <input
          name="emergencyContact"
          defaultValue={parent.emergencyContact ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Internal notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={parent.notes ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 btn-primary disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save parent"}
      </button>
    </form>
  );
}

function FormMessages({ state }: { state: AdminUserFormState }) {
  return (
    <>
      {state?.ok ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Parent account saved.
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
