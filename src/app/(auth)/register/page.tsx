import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/brand";

export const metadata = {
  title: "Create account | jomngaji.my",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[36px] border border-slate-200/80 bg-white shadow-xl shadow-slate-950/10">
        <section className="bg-[#0d4f4f] px-8 py-10 text-center text-white md:px-10">
          <Logo variant="full" surface="pill" href="/" className="mx-auto max-w-[200px]" />
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#c5a059]">{APP_TAGLINE}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/80">
            One learning portal for learners and parents — book classes, pay, and track progress.
          </p>
        </section>

        <section className="px-8 py-8 md:px-10 md:py-10">
          <RegisterForm />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
