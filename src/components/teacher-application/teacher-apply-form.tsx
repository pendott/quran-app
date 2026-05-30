"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  EveningSlotPicker,
  buildDefaultWeekdaySlotKeys,
  selectedKeysToSlots,
} from "@/components/availability/evening-slot-picker";
import { EVENING_BOOKING_SLOTS } from "@/lib/availability/evening-slots";
import {
  HEARD_FROM_OPTIONS,
  ID_DOCUMENT_OPTIONS,
  LANGUAGE_MODE_OPTIONS,
  STUDENT_LEVEL_OPTIONS,
  TEACHER_CODE_OF_CONDUCT,
  TEACHING_SUBJECT_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/lib/teacher-application/constants";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#c5a059]/30 focus:border-[#c5a059] focus:ring-2";
const labelClass = "text-sm font-medium text-slate-800";
const fileInputClass = cn(
  inputClass,
  "file:mr-3 file:rounded-full file:border-0 file:bg-[#0d4f4f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white",
);

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      {message}
    </p>
  );
}

export function TeacherApplyForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("Asia/Kuala_Lumpur");
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [certName, setCertName] = useState<string | null>(null);
  const [heardFrom, setHeardFrom] = useState("");
  const [idDocumentType, setIdDocumentType] = useState("IC");
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<Set<string>>(() => buildDefaultWeekdaySlotKeys());

  const proposedAvailabilityJson = useMemo(
    () =>
      JSON.stringify({
        timezone,
        slots: selectedKeysToSlots(selectedSlotKeys),
      }),
    [timezone, selectedSlotKeys],
  );

  function toggleSlot(key: string) {
    setSelectedSlotKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedSlotKeys.size === 0) {
      setError("Select at least one availability slot.");
      return;
    }

    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/teacher-application", {
        method: "POST",
        body: formData,
      });

      let payload: { ok?: boolean; error?: string | null } = {};
      try {
        payload = (await response.json()) as { ok?: boolean; error?: string | null };
      } catch {
        payload = {};
      }

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Could not submit your application. Try smaller files or try again.");
        return;
      }

      router.push("/teach/apply/success");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" encType="multipart/form-data">
      <FormError message={error} />

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">About you</h2>
          <p className="mt-1 text-sm text-slate-600">We review every application before teachers can accept bookings.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display name" hint="Shown to families on jomngaji.my">
            <input name="name" required className={inputClass} placeholder="Ustaz Ahmad" />
          </Field>
          <Field label="Full legal name" hint="As on your IC or passport">
            <input name="legalName" required className={inputClass} placeholder="Ahmad bin Abdullah" />
          </Field>
          <Field label="ID type">
            <select
              name="idDocumentType"
              required
              className={inputClass}
              value={idDocumentType}
              onChange={(e) => setIdDocumentType(e.target.value)}
            >
              {ID_DOCUMENT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={idDocumentType === "IC" ? "IC number" : "Passport number"}
            hint={idDocumentType === "IC" ? "12 digits, no dashes" : "As printed on passport"}
          >
            <input
              name="idDocumentNumber"
              required
              className={inputClass}
              placeholder={idDocumentType === "IC" ? "900101015432" : "A12345678"}
              autoComplete="off"
            />
          </Field>
          <Field label="Age">
            <input name="age" type="number" min={18} max={80} required className={inputClass} placeholder="28" />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@email.com" />
          </Field>
          <Field label="Phone (optional)">
            <input name="phone" type="tel" className={inputClass} placeholder="+60 12-345 6789" />
          </Field>
        </div>
        <Field label="Profile photo" hint="JPG, PNG, or WebP · max 2 MB">
          <input
            name="photo"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            className={fileInputClass}
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
          />
          {photoName ? <p className="mt-1 text-xs text-slate-600">Selected: {photoName}</p> : null}
        </Field>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-slate-900">Qualifications & experience</h2>
        <Field label="Qualifications" hint="Certificates, ijazah, formal training, or relevant study">
          <textarea name="qualifications" required rows={4} className={inputClass} placeholder="e.g. Ijazah in Tajwid, 3 years teaching at…" />
        </Field>
        <Field label="Ijazah / certification upload" hint="PDF, JPG, PNG, or WebP · max 5 MB">
          <input
            name="certification"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className={fileInputClass}
            onChange={(e) => setCertName(e.target.files?.[0]?.name ?? null)}
          />
          {certName ? <p className="mt-1 text-xs text-slate-600">Selected: {certName}</p> : null}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Years of teaching experience">
            <input name="experienceYears" type="number" min={0} max={60} required className={inputClass} defaultValue={0} />
          </Field>
          <Field label="Maximum students per week" hint="How many students you can teach in a typical week">
            <input
              name="maxStudentsPerWeek"
              type="number"
              min={1}
              max={80}
              required
              className={inputClass}
              defaultValue={10}
            />
          </Field>
          <Field label="Your timezone">
            <select
              name="timezone"
              className={inputClass}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Tell us about yourself">
          <textarea
            name="about"
            required
            rows={5}
            minLength={30}
            className={inputClass}
            placeholder="Your teaching style, who you enjoy teaching, and why you want to join jomngaji.my…"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Student levels you teach</h2>
        <p className="text-sm text-slate-600">Tick all learner levels you are comfortable with.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {STUDENT_LEVEL_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-[#c5a059]/60">
                <input type="checkbox" name="studentLevels" value={opt.id} className="mt-1 h-4 w-4 rounded border-slate-300" />
                <span className="text-sm text-slate-800">{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">What can you teach?</h2>
        <p className="text-sm text-slate-600">Tick all subjects you are comfortable teaching.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TEACHING_SUBJECT_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-[#c5a059]/60">
                <input type="checkbox" name="teachingSubjects" value={opt.id} className="mt-1 h-4 w-4 rounded border-slate-300" />
                <span className="text-sm text-slate-800">{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Mode of language</h2>
        <p className="text-sm text-slate-600">Languages you can use comfortably during class.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LANGUAGE_MODE_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-[#c5a059]/60">
                <input type="checkbox" name="languages" value={opt.id} className="mt-1 h-4 w-4 rounded border-slate-300" />
                <span className="text-sm text-slate-800">{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Weekly availability</h2>
        <p className="text-sm text-slate-600">
          Tick every 1-hour slot you are free to teach (60-minute class, 15-minute break before the next slot). Weekdays
          pre-select evening hours from 6:00&nbsp;PM — change any day or add morning and afternoon slots.
        </p>
        <EveningSlotPicker
          selectedKeys={selectedSlotKeys}
          onToggle={(key) => toggleSlot(key)}
        />
        <input type="hidden" name="proposedAvailability" value={proposedAvailabilityJson} readOnly />
        {selectedSlotKeys.size === 0 ? (
          <p className="text-sm text-amber-800">Select at least one time slot to continue.</p>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">How did you hear about us?</h2>
        <Field label="Source">
          <select
            name="heardFrom"
            required
            className={inputClass}
            value={heardFrom}
            onChange={(e) => setHeardFrom(e.target.value)}
          >
            <option value="" disabled>
              Select one…
            </option>
            {HEARD_FROM_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        {heardFrom === "other" ? (
          <Field label="Please specify">
            <input name="heardFromOther" required className={inputClass} placeholder="e.g. Flyer at surau" />
          </Field>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Confirmations</h2>
        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#0d4f4f]">
            Read sample teacher code of conduct
          </summary>
          <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-xs leading-6 text-slate-700">
            {TEACHER_CODE_OF_CONDUCT}
          </pre>
        </details>
        <ul className="space-y-3">
          <li>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
              <input type="checkbox" name="confirmAccurate" required className="mt-1 h-4 w-4 rounded border-slate-300" />
              <span>
                I confirm that all information and documents in this application are accurate and belong to me.
              </span>
            </label>
          </li>
          <li>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
              <input
                type="checkbox"
                name="confirmCodeOfConduct"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>I agree to follow the jomngaji.my teacher code of conduct if my application is approved.</span>
            </label>
          </li>
          <li>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
              <input
                type="checkbox"
                name="consentBackgroundCheck"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>
                I consent to a background or reference check if required by jomngaji.my before or after approval.
              </span>
            </label>
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={pending || selectedSlotKeys.size === 0}
          className="rounded-full bg-[#c5a059] px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[#b8924f] disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
        <p className="text-xs text-slate-500">
          Approved teachers receive login details from our team. IC/passport and certification files are kept
          confidential and used only for verification.
        </p>
      </div>
    </form>
  );
}
