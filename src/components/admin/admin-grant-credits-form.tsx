"use client";

import { useActionState } from "react";
import {
  adminCreditsFormInitial,
  adminGrantCreditsAction,
  type AdminCreditsFormState,
} from "@/app/actions/admin-credits";
import type { AdminCreditStudentOption } from "@/server/queries/admin-credits";

type Props = {
  students: AdminCreditStudentOption[];
  defaultStudentId?: string;
};

export function AdminGrantCreditsForm({ students, defaultStudentId }: Props) {
  const [state, formAction, pending] = useActionState(adminGrantCreditsAction, adminCreditsFormInitial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <FormMessages state={state} />

      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Student</span>
        <select
          name="studentId"
          required
          defaultValue={defaultStudentId ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="" disabled>
            Select student…
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} — {s.parentNames} ({s.remaining} left)
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Credits to add</span>
        <input
          name="credits"
          type="number"
          min={1}
          max={500}
          defaultValue={1}
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Valid for (days)</span>
        <input
          name="expiresInDays"
          type="number"
          min={1}
          max={730}
          defaultValue={365}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Note (optional)</span>
        <input
          name="note"
          placeholder="e.g. Ramadan promo, bank transfer ref…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending || students.length === 0}
        className="sm:col-span-2 btn-primary disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add credits"}
      </button>
    </form>
  );
}

function FormMessages({ state }: { state: AdminCreditsFormState }) {
  return (
    <>
      {state?.ok && state.message ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {state.message}
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
