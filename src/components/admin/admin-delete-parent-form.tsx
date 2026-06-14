"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { adminDeleteParentAction, adminUserFormInitial } from "@/app/actions/admin-users";
import type { AdminParentForEdit } from "@/server/queries/admin-users";

type Props = { parent: AdminParentForEdit };

export function AdminDeleteParentForm({ parent }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(adminDeleteParentAction, adminUserFormInitial);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin/parents?deleted=1");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={(e) => {
        const message = [
          `Delete ${parent.name || parent.email}?`,
          "This permanently removes the parent login and billing profile.",
          parent.studentCount
            ? `Linked student profile(s) will remain — ${parent.studentCount} child account(s) will be unlinked.`
            : "No linked students.",
          parent.bookingCount
            ? `Also deletes ${parent.bookingCount} booking record(s) they created.`
            : null,
          parent.packagePurchaseCount
            ? `Also deletes ${parent.packagePurchaseCount} package purchase(s) they made.`
            : null,
          "This cannot be undone.",
        ]
          .filter(Boolean)
          .join("\n\n");
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={parent.userId} />
      {state?.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      ) : null}
      <p className="text-sm text-slate-600">
        {parent.studentCount > 0
          ? `${parent.studentCount} linked student(s) will stay in the roster but lose this parent link.`
          : "No students linked to this parent."}
        {parent.bookingCount > 0 ? ` ${parent.bookingCount} booking(s) will be removed.` : null}
      </p>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input name="confirmDelete" type="checkbox" required className="mt-1 rounded border-slate-300" />
        <span>I understand this parent account will be permanently deleted.</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete parent"}
      </button>
    </form>
  );
}
