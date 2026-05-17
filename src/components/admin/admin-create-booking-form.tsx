"use client";

import { useActionState } from "react";
import { adminCreateBookingAction, type AdminBookingFormState } from "@/app/actions/admin-booking";
import type { AdminBookingPickerStudent, AdminBookingPickerTeacher } from "@/server/queries/admin-booking";

const initial: AdminBookingFormState = { ok: false, error: null };

type Props = {
  students: AdminBookingPickerStudent[];
  teachers: AdminBookingPickerTeacher[];
};

export function AdminCreateBookingForm({ students, teachers }: Props) {
  const [state, formAction, pending] = useActionState(adminCreateBookingAction, initial);

  if (!students.length || !teachers.length) {
    return <p className="text-sm text-slate-500">Add at least one student and one teacher before creating bookings.</p>;
  }

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {state?.error ? (
        <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.error}
        </p>
      ) : null}

      <label className="text-sm">
        <span className="mb-1 block font-medium">Student</span>
        <select name="studentId" required className="w-full rounded-xl border border-slate-200 px-3 py-2">
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Teacher</span>
        <select name="teacherId" required className="w-full rounded-xl border border-slate-200 px-3 py-2">
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Start time</span>
        <input
          name="scheduledStartAt"
          type="datetime-local"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Duration (minutes)</span>
        <input
          name="durationMinutes"
          type="number"
          min={15}
          max={240}
          defaultValue={60}
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Status</span>
        <select name="status" className="w-full rounded-xl border border-slate-200 px-3 py-2">
          <option value="CONFIRMED">Confirmed (class scheduled)</option>
          <option value="PENDING_PAYMENT">Pending payment</option>
        </select>
      </label>

      <label className="flex items-center gap-2 self-end text-sm text-slate-700">
        <input type="checkbox" name="usePackage" className="rounded border-slate-300 text-teal-600" />
        Use package credit (confirmed only)
      </label>

      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create booking"}
      </button>
    </form>
  );
}
