"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  adminDeleteTeacherAction,
  adminUserFormInitial,
} from "@/app/actions/admin-users";
import type { AdminTeacherForEdit } from "@/server/queries/admin-users";

type Props = { teacher: AdminTeacherForEdit };

export function AdminDeleteTeacherForm({ teacher }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(adminDeleteTeacherAction, adminUserFormInitial);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin/teachers?deleted=1");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(e) => {
        const message = [
          `Delete ${teacher.name || teacher.email}?`,
          "This permanently removes their login, profile, availability, and student assignments.",
          teacher.bookingCount
            ? `Also deletes ${teacher.bookingCount} booking record(s) and related class history.`
            : null,
          "This cannot be undone.",
        ]
          .filter(Boolean)
          .join("\n\n");
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="teacherId" value={teacher.id} />
      {state?.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      ) : null}
      <p className="text-sm text-slate-600">
        {teacher.bookingCount > 0
          ? `${teacher.bookingCount} booking(s) on record will be removed.`
          : "No bookings on record."}
        {teacher.activeStudentCount > 0
          ? ` ${teacher.activeStudentCount} active student assignment(s) will end.`
          : null}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          name="confirmDelete"
          type="checkbox"
          required
          className="mt-1 rounded border-slate-300"
        />
        <span>I understand this teacher account will be permanently deleted.</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete teacher"}
      </button>
    </form>
  );
}
