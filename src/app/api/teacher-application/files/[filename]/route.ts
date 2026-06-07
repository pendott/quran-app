import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "teacher-applications");

const mimeByExt: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

function resolveUploadPath(filename: string) {
  if (!/^[\w.-]+$/.test(filename)) {
    return null;
  }
  const resolved = path.resolve(UPLOAD_DIR, filename);
  const root = path.resolve(UPLOAD_DIR);
  if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
    return null;
  }
  return resolved;
}

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { filename } = await context.params;
  const filePath = resolveUploadPath(decodeURIComponent(filename));
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = mimeByExt[ext] ?? "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
