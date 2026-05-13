import Link from "next/link";
import { ArrowRight, Calendar, Shield, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.15),transparent)]"
      />
      <div className="mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Built for online Quran schools
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]">
          Run Quran recitation classes like a modern SaaS
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Parents book teachers, you collect per-session or package payments, classes go live with meeting links,
          and every lesson leaves a clear trail of notes and progress.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/login?callbackUrl=%2Fstudents"
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500"
          >
            Start as a family
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/login?callbackUrl=%2Fadmin"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Open admin console
          </Link>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" aria-hidden />
            Calendar booking with teacher availability
          </li>
          <li className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-600" aria-hidden />
            Role-based access for admin, teacher, and family
          </li>
        </ul>
      </div>
    </section>
  );
}
