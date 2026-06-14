"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { addWeeks, startOfWeek } from "date-fns";
import {
  familyUpdateBookingAction,
  type FamilyBookingManageState,
} from "@/app/actions/family-booking-manage";
import { getBookingSlotsAction } from "@/app/actions/booking";
import { formatDateTime } from "@/lib/format";

type TeacherOption = { id: string; name: string };
type Slot = { start: string; end: string };

type Props = {
  booking: {
    id: string;
    studentName: string;
    teacherId: string;
    scheduledStartAt: Date;
    status: string;
    durationMinutes: number;
    rescheduleCount: number;
    maxReschedules: number;
    noticeHours: number;
  };
  teachers: TeacherOption[];
};

const initial: FamilyBookingManageState = { ok: false, error: null };

export function FamilyEditBookingForm({ booking, teachers }: Props) {
  const [state, formAction, pending] = useActionState(familyUpdateBookingAction, initial);
  const [teacherId, setTeacherId] = useState(booking.teacherId);
  const [weekOffset, setWeekOffset] = useState(0);
  const [slotStart, setSlotStart] = useState("");
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

  const canEdit =
    booking.status === "CONFIRMED" ||
    booking.status === "RESCHEDULED" ||
    booking.status === "PENDING_PAYMENT";

  if (!canEdit) {
    return (
      <p className="text-sm text-slate-600">
        This booking is <strong>{booking.status.replace(/_/g, " ").toLowerCase()}</strong> and cannot be
        rescheduled here.
      </p>
    );
  }

  if (booking.status === "PENDING_PAYMENT") {
    return (
      <p className="text-sm text-slate-600">
        This booking is awaiting payment. Cancel it and create a new booking if you need a different slot.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="bookingId" value={booking.id} />
      <input type="hidden" name="slotStart" value={slotStart} />

      <p className="text-sm text-slate-600">
        Student: <strong className="text-slate-900">{booking.studentName}</strong> · Current slot:{" "}
        <strong className="text-slate-900">{formatDateTime(booking.scheduledStartAt)}</strong>
      </p>

      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Reschedules used: {booking.rescheduleCount} / {booking.maxReschedules}. Changes must be made at least{" "}
        {booking.noticeHours} hours before class.
      </p>

      {state.error && !state.ok ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-800">Teacher</span>
        <select
          name="teacherId"
          value={teacherId}
          onChange={(e) => {
            setTeacherId(e.target.value);
            setSlotStart("");
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Previous week
        </button>
        <p className="text-xs font-medium text-slate-600">Week of {formatDateTime(weekStart)}</p>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Next week
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">New slot</p>
        {slotsLoading ? (
          <p className="text-sm text-slate-500">Loading open slots…</p>
        ) : slots.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {slots.map((slot) => {
              const selected = slotStart === slot.start;
              return (
                <li key={slot.start}>
                  <button
                    type="button"
                    onClick={() => setSlotStart(slot.start)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? "border-[#0d4f4f] bg-[#0d4f4f]/5 font-semibold text-[#0d4f4f]"
                        : "border-slate-200 text-slate-700 hover:border-[#0d4f4f]/40"
                    }`}
                  >
                    {formatDateTime(new Date(slot.start))}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No open slots this week for this teacher.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending || !slotStart}
        className="btn-primary disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save new time"}
      </button>
    </form>
  );
}
