import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/brand";

export const metadata = {
  title: "Forgot password | jomngaji.my",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[36px] border border-slate-200/80 bg-white shadow-xl shadow-slate-950/10">
        <section className="bg-[#0d4f4f] px-8 py-10 text-center text-white md:px-10">
          <Logo variant="full" surface="pill" href="/" className="mx-auto max-w-[200px]" />
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#c5a059]">{APP_TAGLINE}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Forgot password</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/80">
            For teacher and learner accounts. We will email you a link to choose a new password.
          </p>
        </section>

        <section className="px-8 py-8 md:px-10 md:py-10">
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
