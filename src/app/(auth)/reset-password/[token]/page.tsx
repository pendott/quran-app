import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/brand";
import { getPasswordResetEmailForToken } from "@/server/auth/password-reset";

export const metadata = {
  title: "Reset password | jomngaji.my",
};

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const email = await getPasswordResetEmailForToken(token);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[36px] border border-slate-200/80 bg-white shadow-xl shadow-slate-950/10">
        <section className="bg-[#0d4f4f] px-8 py-10 text-center text-white md:px-10">
          <Logo variant="full" surface="pill" href="/" className="mx-auto max-w-[200px]" />
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#c5a059]">{APP_TAGLINE}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Choose a new password</h1>
          {email ? (
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/80">
              Resetting password for <strong>{email}</strong>
            </p>
          ) : (
            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/80">
              This reset link is invalid or has expired.
            </p>
          )}
        </section>

        <section className="px-8 py-8 md:px-10 md:py-10">
          {email ? (
            <>
              <ResetPasswordForm token={token} />
              <p className="mt-6 text-center text-sm text-slate-600">
                Link expired?{" "}
                <Link href="/forgot-password" className="font-semibold text-[#0d4f4f] hover:underline">
                  Request a new one
                </Link>
              </p>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600">Request a fresh link to continue.</p>
              <Link href="/forgot-password" className="btn-primary inline-flex px-6 py-3">
                Forgot password
              </Link>
              <p className="text-sm text-slate-600">
                <Link href="/login" className="font-semibold text-[#0d4f4f] hover:underline">
                  Back to sign in
                </Link>
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
