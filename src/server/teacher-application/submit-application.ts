import { TeacherApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailable, isSchemaOutOfDate } from "@/server/db-guard";
import {
  parseLanguagesFromForm,
  parseProposedAvailabilityJson,
  parseStudentLevelsFromForm,
  parseTeachingSubjectsFromForm,
  teacherApplicationSchema,
} from "@/server/teacher-application/parse-form";
import { sendTeacherApplicationReceivedEmail } from "@/server/teacher-application/emails";
import {
  saveTeacherApplicationCertification,
  saveTeacherApplicationPhoto,
} from "@/server/teacher-application/save-upload";

export type SubmitTeacherApplicationResult =
  | { ok: true; error: null }
  | { ok: false; error: string };

export async function submitTeacherApplication(
  formData: FormData,
): Promise<SubmitTeacherApplicationResult> {
  try {
    return await processTeacherApplication(formData);
  } catch (error) {
    console.error("submitTeacherApplication", error);
    if (isSchemaOutOfDate(error)) {
      return {
        ok: false,
        error: "The server database is not up to date. Ask the site admin to run prisma migrate deploy.",
      };
    }
    if (isDatabaseUnavailable(error)) {
      return { ok: false, error: "Database is unavailable. Please try again later." };
    }
    return { ok: false, error: "Something went wrong. Please try again or use smaller photo files." };
  }
}

async function processTeacherApplication(
  formData: FormData,
): Promise<SubmitTeacherApplicationResult> {
  const proposedAvailability = parseProposedAvailabilityJson(
    String(formData.get("proposedAvailability") ?? ""),
  );
  if (!proposedAvailability) {
    return { ok: false, error: "Add at least one weekly availability slot with valid times" };
  }

  const parsed = teacherApplicationSchema.safeParse({
    name: formData.get("name"),
    legalName: formData.get("legalName"),
    idDocumentType: formData.get("idDocumentType"),
    idDocumentNumber: formData.get("idDocumentNumber"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    age: formData.get("age"),
    qualifications: formData.get("qualifications"),
    experienceYears: formData.get("experienceYears"),
    about: formData.get("about"),
    teachingSubjects: parseTeachingSubjectsFromForm(formData),
    studentLevels: parseStudentLevelsFromForm(formData),
    languages: parseLanguagesFromForm(formData),
    maxStudentsPerWeek: formData.get("maxStudentsPerWeek"),
    heardFrom: formData.get("heardFrom"),
    heardFromOther: formData.get("heardFromOther") || undefined,
    proposedAvailability,
    timezone: formData.get("timezone") || proposedAvailability.timezone,
    confirmAccurate: formData.get("confirmAccurate"),
    confirmCodeOfConduct: formData.get("confirmCodeOfConduct"),
    consentBackgroundCheck: formData.get("consentBackgroundCheck"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Please check the form" };
  }

  const email = parsed.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false, error: "This email already has an account. Sign in or use another email." };
  }

  const pending = await prisma.teacherApplication.findFirst({
    where: { email, status: TeacherApplicationStatus.PENDING },
  });
  if (pending) {
    return {
      ok: false,
      error: "You already submitted an application. We will email you when it is reviewed.",
    };
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return { ok: false, error: "Profile photo is required" };
  }

  const certification = formData.get("certification");
  if (!(certification instanceof File)) {
    return { ok: false, error: "Ijazah or certification upload is required" };
  }

  const applicationId = crypto.randomUUID();

  const savedPhoto = await saveTeacherApplicationPhoto(photo, applicationId);
  if ("error" in savedPhoto) {
    return { ok: false, error: savedPhoto.error ?? "Could not save photo" };
  }

  const savedCert = await saveTeacherApplicationCertification(certification, applicationId);
  if ("error" in savedCert) {
    return { ok: false, error: savedCert.error ?? "Could not save certification" };
  }

  const applicantName = parsed.data.name.trim();

  await prisma.teacherApplication.create({
    data: {
      id: applicationId,
      email,
      name: applicantName,
      legalName: parsed.data.legalName.trim(),
      idDocumentType: parsed.data.idDocumentType,
      idDocumentNumber: parsed.data.idDocumentNumber,
      phone: parsed.data.phone?.trim() || null,
      age: parsed.data.age,
      qualifications: parsed.data.qualifications.trim(),
      experienceYears: parsed.data.experienceYears,
      about: parsed.data.about.trim(),
      photoPath: savedPhoto.photoPath,
      certificationPath: savedCert.certificationPath,
      teachingSubjects: parsed.data.teachingSubjects,
      studentLevels: parsed.data.studentLevels,
      languages: parsed.data.languages,
      maxStudentsPerWeek: parsed.data.maxStudentsPerWeek,
      heardFrom: parsed.data.heardFrom,
      heardFromOther: parsed.data.heardFromOther ?? null,
      proposedAvailability: parsed.data.proposedAvailability,
      timezone: parsed.data.timezone,
      confirmedAccurate: true,
      confirmedCodeOfConduct: true,
      consentBackgroundCheck: true,
    },
  });

  void sendTeacherApplicationReceivedEmail({ to: email, name: applicantName });

  return { ok: true, error: null };
}
