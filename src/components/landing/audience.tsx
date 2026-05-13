import Link from "next/link";
import { GraduationCap, LayoutDashboard, Users } from "lucide-react";

const cards = [
  {
    icon: LayoutDashboard,
    title: "Admin",
    body: "Teachers, students, bookings, payments, pricing rules, and reports in one calm interface.",
    href: "/login?callbackUrl=%2Fadmin",
    cta: "Go to admin",
  },
  {
    icon: GraduationCap,
    title: "Teacher",
    body: "Today’s schedule, start class, meeting link, attendance, and structured Quran notes per student.",
    href: "/login?callbackUrl=%2Fteacher",
    cta: "Open teacher desk",
  },
  {
    icon: Users,
    title: "Student / Parent",
    body: "Book slots, pay or use package credits, join class, read teacher notes, and follow surah progress.",
    href: "/login?callbackUrl=%2Fstudents",
    cta: "Open family portal",
  },
];

export function Audience() {
  return (
    <section id="for-schools" className="scroll-mt-20 border-t border-slate-200/80 bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">For every role</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          One platform, three tailored workspaces
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map(({ icon: Icon, title, body, href, cta }) => (
            <article
              key={title}
              className="flex flex-col rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{body}</p>
              <Link
                href={href}
                className="mt-6 inline-flex w-fit items-center text-sm font-semibold text-teal-700 underline-offset-4 hover:underline"
              >
                {cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
