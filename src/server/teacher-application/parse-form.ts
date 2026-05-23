import { IdDocumentType } from "@prisma/client";
import { z } from "zod";
import {
  HEARD_FROM_OPTIONS,
  LANGUAGE_MODE_OPTIONS,
  STUDENT_LEVEL_OPTIONS,
  TEACHING_SUBJECT_OPTIONS,
} from "@/lib/teacher-application/constants";
import type { ProposedAvailability } from "@/lib/teacher-application/types";

const subjectIds = TEACHING_SUBJECT_OPTIONS.map((o) => o.id) as [string, ...string[]];
const levelIds = STUDENT_LEVEL_OPTIONS.map((o) => o.id) as [string, ...string[]];
const languageIds = LANGUAGE_MODE_OPTIONS.map((o) => o.id) as [string, ...string[]];
const heardFromIds = HEARD_FROM_OPTIONS.map((o) => o.id) as [string, ...string[]];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  slotDurationMinutes: z.number().int().min(15).max(180).optional(),
});

const availabilitySchema = z.object({
  timezone: z.string().min(1),
  slots: z.array(slotSchema).min(1, "Add at least one weekly availability slot"),
});

function formChecked(value: unknown) {
  return value === "on" || value === "true" || value === true;
}

function normalizeIdNumber(type: IdDocumentType, raw: string) {
  const trimmed = raw.trim().replace(/[\s-]/g, "");
  if (type === IdDocumentType.IC) {
    if (!/^\d{12}$/.test(trimmed)) {
      return { ok: false as const, message: "Malaysian IC must be 12 digits (no letters)" };
    }
    return { ok: true as const, value: trimmed };
  }
  if (trimmed.length < 6 || trimmed.length > 20) {
    return { ok: false as const, message: "Passport number must be 6–20 characters" };
  }
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    return { ok: false as const, message: "Passport number may only contain letters and numbers" };
  }
  return { ok: true as const, value: trimmed.toUpperCase() };
}

const requiredCheckbox = z
  .unknown()
  .refine(formChecked, { message: "This confirmation is required" });

export const teacherApplicationSchema = z
  .object({
    name: z.string().min(2, "Display name is required"),
    legalName: z.string().min(2, "Full legal name is required"),
    idDocumentType: z.nativeEnum(IdDocumentType),
    idDocumentNumber: z.string().min(1, "IC or passport number is required"),
    email: z.string().email(),
    phone: z.string().optional(),
    age: z.coerce.number().int().min(18).max(80),
    qualifications: z.string().min(10, "Describe your qualifications"),
    experienceYears: z.coerce.number().int().min(0).max(60),
    about: z.string().min(30, "Tell us a bit more about yourself"),
    teachingSubjects: z.array(z.enum(subjectIds)).min(1, "Select at least one subject"),
    studentLevels: z.array(z.enum(levelIds)).min(1, "Select at least one student level"),
    languages: z.array(z.enum(languageIds)).min(1, "Select at least one language"),
    maxStudentsPerWeek: z.coerce.number().int().min(1).max(80),
    heardFrom: z.enum(heardFromIds),
    heardFromOther: z.string().optional(),
    proposedAvailability: availabilitySchema,
    timezone: z.string().min(1),
    confirmAccurate: requiredCheckbox,
    confirmCodeOfConduct: requiredCheckbox,
    consentBackgroundCheck: requiredCheckbox,
  })
  .superRefine((data, ctx) => {
    const idCheck = normalizeIdNumber(data.idDocumentType, data.idDocumentNumber);
    if (!idCheck.ok) {
      ctx.addIssue({ code: "custom", path: ["idDocumentNumber"], message: idCheck.message });
    }
    if (data.heardFrom === "other" && (!data.heardFromOther || data.heardFromOther.trim().length < 2)) {
      ctx.addIssue({
        code: "custom",
        path: ["heardFromOther"],
        message: "Please tell us how you heard about us",
      });
    }
  })
  .transform((data) => {
    const idCheck = normalizeIdNumber(data.idDocumentType, data.idDocumentNumber);
    return {
      ...data,
      idDocumentNumber: idCheck.ok ? idCheck.value : data.idDocumentNumber,
      heardFromOther: data.heardFrom === "other" ? data.heardFromOther?.trim() : undefined,
    };
  });

export function parseProposedAvailabilityJson(raw: string): ProposedAvailability | null {
  try {
    const data = JSON.parse(raw) as unknown;
    const parsed = availabilitySchema.safeParse(data);
    if (!parsed.success) return null;
    return {
      timezone: parsed.data.timezone,
      slots: parsed.data.slots.map((s) => ({
        ...s,
        slotDurationMinutes: s.slotDurationMinutes ?? 60,
      })),
    };
  } catch {
    return null;
  }
}

export function parseTeachingSubjectsFromForm(formData: FormData) {
  return formData.getAll("teachingSubjects").map(String);
}

export function parseStudentLevelsFromForm(formData: FormData) {
  return formData.getAll("studentLevels").map(String);
}

export function parseLanguagesFromForm(formData: FormData) {
  return formData.getAll("languages").map(String);
}
