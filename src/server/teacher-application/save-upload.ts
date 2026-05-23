import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const CERT_MAX_BYTES = 5 * 1024 * 1024;

const photoMimes = new Set(["image/jpeg", "image/png", "image/webp"]);
const certMimes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

const extByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

async function saveFile(file: File, applicationId: string, prefix: "photo" | "cert") {
  const dir = path.join(process.cwd(), "public", "uploads", "teacher-applications");
  await mkdir(dir, { recursive: true });

  const safeId = applicationId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ext = extByMime[file.type];
  if (!ext) return { error: "Unsupported file type" as const };

  const filename = `${safeId}-${prefix}-${randomBytes(4).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return { path: `/uploads/teacher-applications/${filename}` as const };
}

export async function saveTeacherApplicationPhoto(file: File, applicationId: string) {
  if (!file.size) return { error: "Profile photo is required" as const };
  if (file.size > PHOTO_MAX_BYTES) return { error: "Photo must be 2 MB or smaller" as const };
  if (!photoMimes.has(file.type)) return { error: "Use a JPG, PNG, or WebP photo" as const };

  const saved = await saveFile(file, applicationId, "photo");
  if ("error" in saved) return { error: saved.error };
  return { photoPath: saved.path };
}

export async function saveTeacherApplicationCertification(file: File, applicationId: string) {
  if (!file.size) return { error: "Ijazah or certification upload is required" as const };
  if (file.size > CERT_MAX_BYTES) return { error: "Certification file must be 5 MB or smaller" as const };
  if (!certMimes.has(file.type)) return { error: "Use a PDF, JPG, PNG, or WebP file" as const };

  const saved = await saveFile(file, applicationId, "cert");
  if ("error" in saved) return { error: saved.error };
  return { certificationPath: saved.path };
}
