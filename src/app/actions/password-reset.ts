"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requestPasswordReset, resetPasswordWithToken } from "@/server/auth/password-reset";

export type PasswordResetState = { ok: boolean; error: string | null; message: string | null };

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function forgotPasswordAction(
  _prev: PasswordResetState | undefined,
  formData: FormData,
): Promise<PasswordResetState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address", message: null };
  }

  try {
    const result = await requestPasswordReset(parsed.data.email);
    if (!result.ok) {
      return { ok: false, error: result.error, message: null };
    }
    return {
      ok: true,
      error: null,
      message: "If an account exists for that email, we sent a reset link. Check your inbox.",
    };
  } catch (e) {
    console.error("forgotPasswordAction", e);
    return { ok: false, error: "Could not process request. Please try again.", message: null };
  }
}

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPasswordAction(
  _prev: PasswordResetState | undefined,
  formData: FormData,
): Promise<PasswordResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form", message: null };
  }

  try {
    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!result.ok) {
      return { ok: false, error: result.error, message: null };
    }
    redirect("/login?reset=1");
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    console.error("resetPasswordAction", e);
    return { ok: false, error: "Could not reset password. Please try again.", message: null };
  }
}
