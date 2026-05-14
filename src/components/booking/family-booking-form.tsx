"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { addWeeks, startOfWeek } from "date-fns";
import { createFamilyBookingAction, getBookingSlotsAction } from "@/app/actions/booking";
import { formatDateTime } from "@/lib/format";

export type BookingTeacherOption = { id: string; name: string };
export type BookingStudentOption = { id: string; displayName: string };

type Slot = { start: string; end: string };

type Props = {
  teachers: BookingTeacherOption[];
  students: BookingStudentOption[];
};

export function FamilyBookingForm({ teachers, students }: Props) {
  const [state, formAction, isPending] = useActionState(createFamilyBookingAction, {
    ok: false,
    error: null as string | null,
  });

  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return addWeeks(base, weekOffset);
  }, [weekOffset]);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;
    void (async () => {
      setSlotsLoading(true);
      const res = await getBookingSlotsAction(teacherId, weekStart.toISOString());
      if (!cancelled) {
        setSlots(res.ok ? res.slots : []);
        setSlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId, weekStart]);

  if (!teachers.length || !students.length) {
    return (
      <p className="text-sm text-slate-600">
        No teachers accepting bookings or no students linked to this account. Run the seed and sign in as a parent.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {state?.ok ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Booking created. Refresh the list below if it does not update automatically.
        </p>
      ) : null}
      {state && "error" in state && state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Student</span>
            <select
              name="studentId"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              defaultValue={students[0]?.id}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Teacher</span>
            <select
              name="teacherId"
              required
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Week</span>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            {weekStart.toLocaleDateString("en-MY", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Next
          </button>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Available slot</legend>
          {slotsLoading ? (
            <p className="text-sm text-slate-500">Loading slots…</p>
          ) : slots.length ? (
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">
              {slots.map((slot) => (
                <label key={slot.start} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-50">
                  <input type="radio" name="slotStart" value={slot.start} required className="text-teal-600" />
                  <span className="text-sm text-slate-800">{formatDateTime(new Date(slot.start))}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No open slots this week for this teacher.</p>
          )}
        </fieldset>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="usePackage" className="rounded border-slate-300 text-teal-600" />
          Use package credit (if available)
        </label>

        <button
          type="submit"
          disabled={isPending || !slots.length}
          className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
        >
          {isPending ? "Booking…" : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}
