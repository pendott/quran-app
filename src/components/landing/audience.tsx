import Link from "next/link";
import { GraduationCap, Heart, Users } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Users,
    title: "Create your account",
    body: "Parents sign up and add learners, or students join with a family invite. No complicated setup.",
    href: "/login?callbackUrl=%2Fstudents",
    cta: "Sign up as a family",
  },
  {
    step: "02",
    icon: GraduationCap,
    title: "Choose your teacher",
    body: "Browse qualified teachers, see availability, and book a time that works — morning, evening, or weekend.",
    href: "/login?callbackUrl=%2Fstudents%2Fbookings",
    cta: "View available slots",
  },
  {
    step: "03",
    icon: Heart,
    title: "Recite & grow",
    body: "Join live class, receive personalised feedback, and watch your surah and ayah progress build over time.",
    href: "/login?callbackUrl=%2Fstudents%2Fprogress",
    cta: "See how progress works",
  },
];

export function Audience() {
  return (
    <section id="learn" className="scroll-mt-24 border-t border-[#0d4f4f]/10 bg-[#faf8f3] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c5a059]">How it works</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#0d4f4f] sm:text-4xl">
          Start your Quran journey in three steps
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#0d4f4f]/70">
          From first booking to daily practice — jomngaji.my keeps learning simple for families across Malaysia and
          beyond.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map(({ step, icon: Icon, title, body, href, cta }) => (
            <article
              key={step}
              className="relative flex flex-col rounded-3xl border border-[#0d4f4f]/10 bg-white p-8 shadow-sm"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a059]">Step {step}</span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d4f4f] text-white">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0d4f4f]">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#0d4f4f]/70">{body}</p>
              <Link
                href={href}
                className="mt-6 inline-flex w-fit items-center text-sm font-semibold text-[#c5a059] underline-offset-4 hover:underline"
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
