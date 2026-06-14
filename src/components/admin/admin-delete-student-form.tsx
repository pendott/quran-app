"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { adminDeleteStudentAction, adminUserFormInitial } from "@/app/actions/admin-users";
import type { AdminStudentForEdit } from "@/server/queries/admin-users";

type Props = { student: AdminStudentForEdit };

export function AdminDeleteStudentForm({ student }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(adminDeleteStudentAction, adminUserFormInitial);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin/students?deleted=1");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(e) => {
        const message = [
          `Delete ${student.displayName}?`,
          "This permanently removes the learner profile, teacher assignments, and parent links.",
          student.hasLogin ? "Their student login account will also be removed." : null,
          student.bookingCount
            ? `Also deletes ${student.bookingCount} booking record(s) and related class history.`
            : null,
          student.packagePurchaseCount
            ? `Also deletes ${student.packagePurchaseCount} package purchase(s) and remaining credits.`
            : null,
          "This cannot be undone.",
        ]
          .filter(Boolean)
          .join("\n\n");
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="studentId" value={student.id} />
      {state?.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      ) : null}
      <p className="text-sm text-slate-600">
        {student.bookingCount > 0
          ? `${student.bookingCount} booking(s) on record will be removed.`
          : "No bookings on record."}
        {student.packagePurchaseCount > 0
          ? ` ${student.packagePurchaseCount} package purchase(s) will be removed.`
          : null}
        {student.parentCount > 0 ? ` Unlinked from ${student.parentCount} parent account(s).` : null}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input name="confirmDelete" type="checkbox" required className="mt-1 rounded border-slate-300" />
        <span>I understand this student profile will be permanently deleted.</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete student"}
      </button>
    </form>
  );
}
