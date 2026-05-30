"use client";

import { WEEKDAY_LABELS } from "@/lib/availability/constants";
import {
  DEFAULT_WEEKDAY_EVENING_SLOT_IDS,
  EVENING_BOOKING_SLOTS,
  parseSlotKey,
  slotKey,
  type EveningSlotTemplate,
} from "@/lib/availability/evening-slots";
import { cn } from "@/lib/utils";

export type SelectedEveningSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
};

type Props = {
  selectedKeys: Set<string>;
  onToggle: (key: string, slot: EveningSlotTemplate, dayOfWeek: number) => void;
  /** Which days show the slot grid (default Mon–Sun). */
  days?: number[];
  className?: string;
};

const allDays = [0, 1, 2, 3, 4, 5, 6];

export function EveningSlotPicker({ selectedKeys, onToggle, days = allDays, className }: Props) {
  return (
    <div className={cn("space-y-4", className)}>
      {days.map((dayOfWeek) => (
        <div key={dayOfWeek} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">{WEEKDAY_LABELS[dayOfWeek]}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EVENING_BOOKING_SLOTS.map((slot) => {
              const key = slotKey(dayOfWeek, slot.startTime, slot.endTime);
              const checked = selectedKeys.has(key);
              return (
                <li key={key}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
                      checked
                        ? "border-[#c5a059] bg-amber-50/80 text-slate-900"
                        : "border-slate-200 text-slate-700 hover:border-[#c5a059]/50",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(key, slot, dayOfWeek)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {slot.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function buildDefaultWeekdaySlotKeys() {
  const keys = new Set<string>();
  for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
    for (const id of DEFAULT_WEEKDAY_EVENING_SLOT_IDS) {
      const slot = EVENING_BOOKING_SLOTS.find((s) => s.id === id);
      if (slot) keys.add(slotKey(dayOfWeek, slot.startTime, slot.endTime));
    }
  }
  return keys;
}

export function selectedKeysToSlots(keys: Set<string>): SelectedEveningSlot[] {
  return [...keys].map((key) => {
    const { dayOfWeek, startTime, endTime } = parseSlotKey(key);
    return {
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes: 60,
    };
  });
}
