import { NextResponse } from "next/server";
import { submitTeacherApplication } from "@/server/teacher-application/submit-application";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await submitTeacherApplication(formData);
    const status = result.ok ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("POST /api/teacher-application", error);
    return NextResponse.json(
      { ok: false, error: "Server error while saving your application. Please try again." },
      { status: 500 },
    );
  }
}
