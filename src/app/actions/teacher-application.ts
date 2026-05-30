"use server";

import { submitTeacherApplication } from "@/server/teacher-application/submit-application";

export type TeacherApplicationFormState = {
  ok: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
};

const initialError: TeacherApplicationFormState = { ok: false, error: null };

/** @deprecated Prefer POST /api/teacher-application for file uploads */
export async function submitTeacherApplicationAction(
  _prev: TeacherApplicationFormState,
  formData: FormData,
): Promise<TeacherApplicationFormState> {
  return submitTeacherApplication(formData);
}

export { initialError as teacherApplicationInitialState };
