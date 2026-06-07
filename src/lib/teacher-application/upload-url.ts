import { parseTeacherApplicationFilename } from "@/server/teacher-application/resolve-upload";

/** Map stored `/uploads/teacher-applications/...` paths to the admin file API. */
export function teacherApplicationFileUrl(storedPath: string | null | undefined) {
  const filename = parseTeacherApplicationFilename(storedPath);
  if (!filename) {
    return null;
  }
  return `/api/teacher-application/files/${encodeURIComponent(filename)}`;
}
