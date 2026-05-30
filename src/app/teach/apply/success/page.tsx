import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Application received | jomngaji.my",
};

export default function TeachApplySuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f3] px-4 py-16">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-lg">
        <Logo variant="full" surface="transparent" href="/" className="mx-auto max-w-[180px]" />
        <h1 className="mt-8 text-2xl font-semibold text-slate-900">Thank you!</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Your teacher application has been received. We sent a confirmation to your email and will review your
          profile. Once approved, you can sign in with the password our team shares with you.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to home
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#c5a059] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#b8924f]"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
