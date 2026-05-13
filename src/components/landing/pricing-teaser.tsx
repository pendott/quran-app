import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Per session",
    price: "From RM 35",
    detail: "Pay as you go for trials or irregular schedules.",
    bullets: ["Single booking checkout", "Email reminders", "Teacher notes after class"],
  },
  {
    name: "Packages",
    price: "4 or 8 sessions",
    detail: "Credits your system can decrement when a booking confirms.",
    bullets: ["Package purchase flow", "Expiry and balance tracking", "Family-friendly receipts"],
    featured: true,
  },
  {
    name: "Monthly",
    price: "Custom",
    detail: "Unlimited or capped monthly plans for serious students.",
    bullets: ["Renewal reminders", "Admin revenue reporting", "Cancellation rules engine"],
  },
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-slate-200/80 bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Pricing model</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Flexible monetization for your school
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          The data model supports per-session, bundle, and monthly billing. Connect Billplz, ToyyibPay, SenangPay, or
          Stripe when you are ready—keys stay on the server.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                tier.featured
                  ? "border-teal-300 bg-teal-50/60 shadow-md shadow-teal-900/5 ring-1 ring-teal-200/80"
                  : "border-slate-200/90 bg-slate-50/40"
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{tier.price}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tier.detail}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-slate-600">
          Ready to wire payments?{" "}
          <Link href="/login?callbackUrl=%2Fadmin" className="font-semibold text-teal-700 hover:underline">
            Sign in as admin
          </Link>{" "}
          to continue setup.
        </p>
      </div>
    </section>
  );
}
