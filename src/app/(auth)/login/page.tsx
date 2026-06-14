import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/brand";

export default async function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[36px] border border-slate-200/80 bg-white shadow-xl shadow-slate-950/10">
        <section className="bg-[#0d4f4f] px-8 py-10 text-center text-white md:px-10">
          <Logo variant="full" surface="pill" href="/" className="mx-auto max-w-[200px]" />
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#c5a059]">{APP_TAGLINE}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/80">
            Sign in to your learning portal, teacher dashboard, or admin workspace.
          </p>
        </section>

        <section className="px-8 py-8 md:px-10 md:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Sign in</p>
          <div className="mt-6">
            <Suspense fallback={<p className="text-sm text-slate-500">Loading form…</p>}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            New here?{" "}
            <Link href="/register" className="font-semibold text-[#0d4f4f] hover:underline">
              Create a learner account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-600">
            <Link href="/forgot-password" className="font-semibold text-[#0d4f4f] hover:underline">
              Forgot your password?
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-600">
            Want to teach on jomngaji.my?{" "}
            <Link href="/teach/apply" className="font-semibold text-[#0d4f4f] hover:underline">
              Apply as a teacher
            </Link>
          </p>
          <div className="mt-4 text-center">
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
