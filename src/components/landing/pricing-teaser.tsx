import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Try a session",
    price: "From RM 35",
    detail: "Perfect for your first lesson or an occasional catch-up.",
    bullets: ["Book one class at a time", "Meet your teacher online", "Notes after class"],
  },
  {
    name: "Session packages",
    price: "4 or 8 classes",
    detail: "Save when you commit to regular learning each week.",
    bullets: ["Credits applied automatically", "Family-friendly receipts", "Email reminders"],
    featured: true,
  },
  {
    name: "Monthly plan",
    price: "Ask us",
    detail: "For dedicated students who want a fixed schedule every month.",
    bullets: ["Priority booking slots", "Progress tracking", "Renewal reminders"],
  },
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="scroll-mt-24 border-t border-[#0d4f4f]/10 bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c5a059]">Simple pricing</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#0d4f4f] sm:text-4xl">
          Learn at your own pace
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#0d4f4f]/70">
          Pay per class or choose a package — secure online payment when you book. No hidden fees, no confusion.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                tier.featured
                  ? "border-[#c5a059]/50 bg-[#c5a059]/10 shadow-md shadow-[#0d4f4f]/5 ring-1 ring-[#c5a059]/30"
                  : "border-[#0d4f4f]/10 bg-[#faf8f3]"
              }`}
            >
              <h3 className="text-lg font-semibold text-[#0d4f4f]">{tier.name}</h3>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0d4f4f]">{tier.price}</p>
              <p className="mt-2 text-sm leading-6 text-[#0d4f4f]/70">{tier.detail}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-[#0d4f4f]/80">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c5a059]" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-[#0d4f4f] px-8 py-10 text-center text-white sm:px-12">
          <h3 className="text-xl font-semibold sm:text-2xl">Ready to start reciting?</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/80">
            Create your account, pick a teacher, and book your first class — learn Quran from anywhere today.
          </p>
          <Link
            href="/login?callbackUrl=%2Fstudents"
            className="mt-6 inline-flex rounded-full bg-[#c5a059] px-6 py-3 text-sm font-semibold text-[#0d4f4f] shadow-lg transition hover:bg-[#d4b06a]"
          >
            Get started free
          </Link>
        </div>
      </div>
    </section>
  );
}
