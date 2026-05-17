"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createAvailabilityAction,
  type AvailabilityFormState,
} from "@/app/actions/availability";
import { deleteAvailabilityAction } from "@/app/actions/availability";
import { formatWeekday, monthNavigation, WEEKDAY_LABELS } from "@/lib/availability/constants";

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
  const nav = monthNavigation(monthKey);

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
        <p className="mt-1 text-sm text-slate-600">Repeats every week. Parents see bookable slots from these hours.</p>

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
          <label className="text-sm">
            <span className="mb-1 block font-medium">Slot length (minutes)</span>
            <input
              name="slotDurationMinutes"
              type="number"
              min={15}
              max={180}
              defaultValue={60}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">From</span>
            <input name="startTime" type="time" required defaultValue="09:00" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Until</span>
            <input name="endTime" type="time" required defaultValue="17:00" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <button
            type="submit"
            disabled={recurringPending}
            className="sm:col-span-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {recurringPending ? "Adding…" : "Add weekly hours"}
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
          <label className="text-sm">
            <span className="mb-1 block font-medium">Slot length (minutes)</span>
            <input
              name="slotDurationMinutes"
              type="number"
              min={15}
              max={180}
              defaultValue={60}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">From</span>
            <input name="startTime" type="time" required defaultValue="09:00" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Until</span>
            <input name="endTime" type="time" required defaultValue="12:00" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <button
            type="submit"
            disabled={exceptionPending}
            className="sm:col-span-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {exceptionPending ? "Adding…" : "Add date-specific hours"}
          </button>
        </form>
      </section>
    </div>
  );
}
