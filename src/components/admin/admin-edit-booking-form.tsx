"use client";

import { useActionState } from "react";
import { BookingStatus } from "@prisma/client";
import { adminUpdateBookingAction, type AdminBookingFormState } from "@/app/actions/admin-booking";
import { toDatetimeLocalValue } from "@/lib/datetime-local";
import type { AdminBookingPickerStudent, AdminBookingPickerTeacher } from "@/server/queries/admin-booking";

const initial: AdminBookingFormState = { ok: false, error: null };

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: BookingStatus.PENDING_PAYMENT, label: "Pending payment" },
  { value: BookingStatus.CONFIRMED, label: "Confirmed" },
  { value: BookingStatus.COMPLETED, label: "Completed" },
  { value: BookingStatus.CANCELLED, label: "Cancelled" },
  { value: BookingStatus.RESCHEDULED, label: "Rescheduled" },
  { value: BookingStatus.NO_SHOW, label: "No show" },
];

type BookingForEdit = {
  id: string;
  studentId: string;
  teacherId: string;
  status: BookingStatus;
  scheduledStartAt: Date;
  durationMinutes: number;
  cancellationReason: string | null;
};

type Props = {
  booking: BookingForEdit;
  students: AdminBookingPickerStudent[];
  teachers: AdminBookingPickerTeacher[];
};

export function AdminEditBookingForm({ booking, students, teachers }: Props) {
  const [state, formAction, pending] = useActionState(adminUpdateBookingAction, initial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="bookingId" value={booking.id} />

      {state?.ok ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Booking saved.
        </p>
      ) : null}
      {state?.error ? (
        <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {state.error}
        </p>
      ) : null}

      <label className="text-sm">
        <span className="mb-1 block font-medium">Student</span>
        <select
          name="studentId"
          required
          defaultValue={booking.studentId}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Teacher</span>
        <select
          name="teacherId"
          required
          defaultValue={booking.teacherId}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
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
          defaultValue={toDatetimeLocalValue(new Date(booking.scheduledStartAt))}
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
          defaultValue={booking.durationMinutes}
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Status</span>
        <select
          name="status"
          defaultValue={booking.status}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Cancellation reason (if cancelled)</span>
        <input
          name="cancellationReason"
          type="text"
          defaultValue={booking.cancellationReason ?? ""}
          placeholder="Optional"
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 btn-primary disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
