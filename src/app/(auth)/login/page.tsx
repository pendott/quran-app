import type { ReactNode } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

const roleCards = [
  {
    title: "Admin",
    description: "Full access to teacher, student, booking, payment, pricing, and recording management.",
  },
  {
    title: "Teacher",
    description: "Limited to assigned classes, student history, attendance, and Quran class notes.",
  },
  {
    title: "Student / Parent",
    description: "Limited to own bookings, package credits, recordings, reminders, and progress.",
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/students";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 md:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
      <section className="rounded-[36px] border border-slate-200/80 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/15 md:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-teal-200">Role-based authentication</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Secure access for every role</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Sign in with the email and password your school issued. You will be routed to the admin console, teacher
          desk, or family portal based on your role.
        </p>
        <div className="mt-8 grid gap-4">
          {roleCards.map((card) => (
            <article key={card.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-950/5 md:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Sign in</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Quran Class</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Default redirect after login is the family portal unless <code className="text-xs">callbackUrl</code> is set
          (for example from the marketing site). Current callback:{" "}
          <span className="font-mono text-xs text-slate-800">{callbackUrl}</span>
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading form…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>
        <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          Keep all provider keys server-side in environment variables. Never expose Zoom, WhatsApp, email, or payment
          secrets in client components.
        </div>
      </section>
    </main>
  );
}
