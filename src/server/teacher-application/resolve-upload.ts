import { access } from "node:fs/promises";
import path from "node:path";

export const TEACHER_APPLICATION_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "teacher-applications",
);

export const teacherApplicationMimeByExt: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export type TeacherApplicationPreviewKind = "image" | "pdf" | "other";

export function parseTeacherApplicationFilename(storedPath: string | null | undefined) {
  if (!storedPath?.startsWith("/uploads/teacher-applications/")) {
    return null;
  }
  const filename = storedPath.slice("/uploads/teacher-applications/".length);
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return null;
  }
  if (!/^[\w.-]+$/.test(filename)) {
    return null;
  }
  return filename;
}

export function teacherApplicationPreviewKind(filename: string): TeacherApplicationPreviewKind {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") return "image";
  return "other";
}

export function resolveTeacherApplicationUploadPath(filename: string) {
  if (!/^[\w.-]+$/.test(filename)) {
    return null;
  }
  const resolved = path.resolve(TEACHER_APPLICATION_UPLOAD_DIR, filename);
  const root = path.resolve(TEACHER_APPLICATION_UPLOAD_DIR);
  if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
    return null;
  }
  return resolved;
}

export async function getTeacherApplicationUploadMeta(storedPath: string | null | undefined) {
  const filename = parseTeacherApplicationFilename(storedPath);
  if (!filename) {
    return { exists: false as const, previewKind: "other" as const, filename: null };
  }

  const filePath = resolveTeacherApplicationUploadPath(filename);
  if (!filePath) {
    return { exists: false as const, previewKind: "other" as const, filename };
  }

  try {
    await access(filePath);
    return {
      exists: true as const,
      previewKind: teacherApplicationPreviewKind(filename),
      filename,
    };
  } catch {
    return {
      exists: false as const,
      previewKind: teacherApplicationPreviewKind(filename),
      filename,
    };
  }
}

export function teacherApplicationContentType(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return teacherApplicationMimeByExt[ext] ?? "application/octet-stream";
}

export function teacherApplicationContentDisposition(filename: string, contentType: string) {
  const mode = contentType === "application/pdf" || contentType.startsWith("image/") ? "inline" : "attachment";
  return `${mode}; filename="${filename.replace(/"/g, "")}"`;
}
