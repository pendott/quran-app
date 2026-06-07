/** Map stored `/uploads/teacher-applications/...` paths to the admin file API. */
export function teacherApplicationFileUrl(storedPath: string | null | undefined) {
  if (!storedPath?.startsWith("/uploads/teacher-applications/")) {
    return null;
  }
  const filename = storedPath.slice("/uploads/teacher-applications/".length);
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return null;
  }
  return `/api/teacher-application/files/${encodeURIComponent(filename)}`;
}
