import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  resolveTeacherApplicationUploadPath,
  teacherApplicationContentDisposition,
  teacherApplicationContentType,
} from "@/server/teacher-application/resolve-upload";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { filename: rawFilename } = await context.params;
  const filename = decodeURIComponent(rawFilename);
  const filePath = resolveTeacherApplicationUploadPath(filename);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    const contentType = teacherApplicationContentType(filename);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": teacherApplicationContentDisposition(filename, contentType),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
