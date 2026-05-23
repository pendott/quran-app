import Link from "next/link";
import { TeacherApplyForm } from "@/components/teacher-application/teacher-apply-form";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/brand";

export const metadata = {
  title: "Apply to teach | jomngaji.my",
  description: "Register as a Quran teacher on jomngaji.my",
};

export default function TeachApplyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3]">
      <header className="border-b border-slate-200/80 bg-[#faf8f3]/95 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Logo variant="full" surface="transparent" href="/" className="max-w-[160px]" />
          <Link
            href="/login?callbackUrl=%2Fteacher"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Already a teacher? Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm uppercase tracking-[0.28em] text-[#9a6b1a]">{APP_TAGLINE}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Apply to teach</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Share your background, what you teach, languages you use in class, and when you are available. Our team reviews
          applications before activating your teacher account.
        </p>

        <div className="mt-10 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <TeacherApplyForm />
        </div>
      </div>
    </main>
  );
}
