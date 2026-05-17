"use client";

import { UserStatus } from "@prisma/client";
import { useActionState } from "react";
import {
  adminUpdateTeacherAction,
  adminUserFormInitial,
  type AdminUserFormState,
} from "@/app/actions/admin-users";
import type { AdminTeacherForEdit } from "@/server/queries/admin-users";

const statusOptions: { value: UserStatus; label: string }[] = [
  { value: UserStatus.ACTIVE, label: "Active" },
  { value: UserStatus.SUSPENDED, label: "Suspended" },
  { value: UserStatus.INVITED, label: "Invited" },
  { value: UserStatus.ARCHIVED, label: "Archived" },
];

type Props = { teacher: AdminTeacherForEdit };

export function AdminEditTeacherForm({ teacher }: Props) {
  const [state, formAction, pending] = useActionState(adminUpdateTeacherAction, adminUserFormInitial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="teacherId" value={teacher.id} />
      <FormMessages state={state} />

      <label className="text-sm">
        <span className="mb-1 block font-medium">Full name</span>
        <input name="name" required defaultValue={teacher.name} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={teacher.email}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Account status</span>
        <select name="status" defaultValue={teacher.status} className="w-full rounded-xl border border-slate-200 px-3 py-2">
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
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Headline</span>
        <input name="headline" defaultValue={teacher.headline ?? ""} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Bio</span>
        <textarea
          name="bio"
          rows={4}
          defaultValue={teacher.bio ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Timezone</span>
        <input name="timezone" defaultValue={teacher.timezone} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Experience (years)</span>
        <input
          name="experienceYears"
          type="number"
          min={0}
          max={60}
          defaultValue={teacher.experienceYears}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Max students</span>
        <input
          name="maxStudents"
          type="number"
          min={1}
          max={500}
          defaultValue={teacher.maxStudents}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          name="isAcceptingBookings"
          type="checkbox"
          defaultChecked={teacher.isAcceptingBookings}
          className="rounded border-slate-300"
        />
        <span>Accepting new bookings</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 btn-primary disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save teacher"}
      </button>
    </form>
  );
}

function FormMessages({ state }: { state: AdminUserFormState }) {
  return (
    <>
      {state?.ok ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Teacher profile saved.
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
