"use client";

import { useActionState } from "react";
import {
  adminUpdateStudentAction,
  adminUserFormInitial,
  type AdminUserFormState,
} from "@/app/actions/admin-users";
import type {
  AdminStudentForEdit,
  AdminUserPickerParent,
  AdminUserPickerTeacher,
} from "@/server/queries/admin-users";

type Props = {
  student: AdminStudentForEdit;
  parents: AdminUserPickerParent[];
  teachers: AdminUserPickerTeacher[];
};

export function AdminEditStudentForm({ student, parents, teachers }: Props) {
  const [state, formAction, pending] = useActionState(adminUpdateStudentAction, adminUserFormInitial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="studentId" value={student.id} />
      <FormMessages state={state} />

      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Display name</span>
        <input
          name="displayName"
          required
          defaultValue={student.displayName}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Learning level</span>
        <input
          name="learningLevel"
          defaultValue={student.learningLevel ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Timezone</span>
        <input
          name="timezone"
          defaultValue={student.timezone}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Current surah</span>
        <input
          name="currentSurah"
          defaultValue={student.currentSurah ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Current ayah</span>
        <input
          name="currentAyah"
          defaultValue={student.currentAyah ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Primary teacher</span>
        <select
          name="primaryTeacherId"
          defaultValue={student.primaryTeacherId ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="">— None —</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Link to parent</span>
        <select
          name="linkParentProfileId"
          defaultValue={student.linkedParentProfileId ?? ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="">— Keep existing only —</option>
          {parents.map((p) => (
            <option key={p.profileId} value={p.profileId}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={student.isActive}
          className="rounded border-slate-300"
        />
        <span>Active in roster</span>
      </label>
      {student.parents.length > 0 ? (
        <p className="text-sm text-slate-600 sm:col-span-2">
          Linked parents: {student.parents.map((p) => p.name).join(", ")}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save student"}
      </button>
    </form>
  );
}

function FormMessages({ state }: { state: AdminUserFormState }) {
  return (
    <>
      {state?.ok ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Student profile saved.
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
