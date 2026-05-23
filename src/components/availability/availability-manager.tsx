"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createAvailabilityAction,
  type AvailabilityFormState,
} from "@/app/actions/availability";
import { deleteAvailabilityAction } from "@/app/actions/availability";
import { formatWeekday, monthNavigation, WEEKDAY_LABELS } from "@/lib/availability/constants";
import { EVENING_BOOKING_SLOTS } from "@/lib/availability/evening-slots";

type RecurringRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

type ExceptionRow = {
  id: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

type Props = {
  teacherId: string;
  teacherName: string;
  monthKey: string;
  recurring: RecurringRow[];
  exceptions: ExceptionRow[];
  basePath: string;
  isAdmin?: boolean;
};

const initial: AvailabilityFormState = { ok: false, error: null };

export function AvailabilityManager({
  teacherId,
  teacherName,
  monthKey,
  recurring,
  exceptions,
  basePath,
  isAdmin,
}: Props) {
  const [recurringState, recurringAction, recurringPending] = useActionState(createAvailabilityAction, initial);
  const [exceptionState, exceptionAction, exceptionPending] = useActionState(createAvailabilityAction, initial);
  const [recurringSlotId, setRecurringSlotId] = useState(EVENING_BOOKING_SLOTS[0]?.id ?? "");
  const [exceptionSlotId, setExceptionSlotId] = useState(EVENING_BOOKING_SLOTS[0]?.id ?? "");
  const nav = monthNavigation(monthKey);
  const recurringSlot = EVENING_BOOKING_SLOTS.find((s) => s.id === recurringSlotId) ?? EVENING_BOOKING_SLOTS[0];
  const exceptionSlot = EVENING_BOOKING_SLOTS.find((s) => s.id === exceptionSlotId) ?? EVENING_BOOKING_SLOTS[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            {isAdmin ? `Managing availability for ${teacherName}` : "Your open hours for families to book"}
          </p>
          <p className="text-lg font-semibold text-slate-900">{nav.label}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`${basePath}?month=${nav.prev}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            ← Prev
          </Link>
          <Link
            href={`${basePath}?month=${nav.next}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Next →
          </Link>
        </div>
      </div>

      <section className="rounded-[24px] border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Weekly schedule</h2>
        <p className="mt-1 text-sm text-slate-600">
          Repeats every week. Pick 1-hour slots (15-minute break between classes), from 8:00&nbsp;AM through
          9:45–10:45&nbsp;PM.
        </p>

        {recurring.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {recurring.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="text-sm text-slate-800">
                  <strong>{formatWeekday(r.dayOfWeek)}</strong> · {r.startTime}–{r.endTime} · {r.slotDurationMinutes}
                  min slots
                </span>
                <form action={deleteAvailabilityAction}>
                  <input type="hidden" name="availabilityId" value={r.id} />
                  <input type="hidden" name="teacherId" value={teacherId} />
                  {isAdmin ? <input type="hidden" name="asAdmin" value="1" /> : null}
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No weekly hours yet. Add a block below.</p>
        )}

        <form action={recurringAction} className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <input type="hidden" name="teacherId" value={teacherId} />
          <input type="hidden" name="type" value="RECURRING" />
          <input type="hidden" name="month" value={monthKey} />
          {isAdmin ? <input type="hidden" name="asAdmin" value="1" /> : null}
          {recurringState?.ok ? (
            <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Weekly block added.
            </p>
          ) : null}
          {recurringState?.error ? (
            <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {recurringState.error}
            </p>
          ) : null}
          <label className="text-sm">
            <span className="mb-1 block font-medium">Day</span>
            <select name="dayOfWeek" required className="w-full rounded-xl border border-slate-200 px-3 py-2">
              {WEEKDAY_LABELS.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Class slot</span>
            <select
              value={recurringSlotId}
              onChange={(e) => setRecurringSlotId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              {EVENING_BOOKING_SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <input type="hidden" name="startTime" value={recurringSlot?.startTime ?? "20:00"} />
          <input type="hidden" name="endTime" value={recurringSlot?.endTime ?? "21:00"} />
          <input type="hidden" name="slotDurationMinutes" value={60} />
          <button
            type="submit"
            disabled={recurringPending}
            className="sm:col-span-2 btn-primary disabled:opacity-50"
          >
            {recurringPending ? "Adding…" : "Add weekly slot"}
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Extra dates this month</h2>
        <p className="mt-1 text-sm text-slate-600">One-off availability on a specific day (e.g. holiday makeup class).</p>

        {exceptions.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {exceptions.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="text-sm text-slate-800">
                  <strong>{e.specificDate}</strong> · {e.startTime}–{e.endTime} · {e.slotDurationMinutes} min
                </span>
                <form action={deleteAvailabilityAction}>
                  <input type="hidden" name="availabilityId" value={e.id} />
                  <input type="hidden" name="teacherId" value={teacherId} />
                  {isAdmin ? <input type="hidden" name="asAdmin" value="1" /> : null}
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No extra dates for {nav.label}.</p>
        )}

        <form action={exceptionAction} className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <input type="hidden" name="teacherId" value={teacherId} />
          <input type="hidden" name="type" value="EXCEPTION" />
          <input type="hidden" name="month" value={monthKey} />
          {isAdmin ? <input type="hidden" name="asAdmin" value="1" /> : null}
          {exceptionState?.ok ? (
            <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Date added.
            </p>
          ) : null}
          {exceptionState?.error ? (
            <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {exceptionState.error}
            </p>
          ) : null}
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Date</span>
            <input
              name="specificDate"
              type="date"
              required
              min={`${monthKey}-01`}
              max={`${monthKey}-31`}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Class slot</span>
            <select
              value={exceptionSlotId}
              onChange={(e) => setExceptionSlotId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              {EVENING_BOOKING_SLOTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <input type="hidden" name="startTime" value={exceptionSlot?.startTime ?? "20:00"} />
          <input type="hidden" name="endTime" value={exceptionSlot?.endTime ?? "21:00"} />
          <input type="hidden" name="slotDurationMinutes" value={60} />
          <button
            type="submit"
            disabled={exceptionPending}
            className="sm:col-span-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {exceptionPending ? "Adding…" : "Add date-specific slot"}
          </button>
        </form>
      </section>
    </div>
  );
}
