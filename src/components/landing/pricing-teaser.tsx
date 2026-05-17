import Link from "next/link";
import { Check } from "lucide-react";
import { brandUi } from "@/lib/brand";
import { cn } from "@/lib/utils";

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
    <section id="pricing" className="scroll-mt-24 border-t border-slate-200/80 bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className={brandUi.sectionLabel}>Simple pricing</p>
        <h2 className={cn("mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl", brandUi.heading)}>
          Learn at your own pace
        </h2>
        <p className={cn("mt-4 max-w-2xl text-base leading-7", brandUi.body)}>
          Pay per class or choose a package — secure online payment when you book. No hidden fees, no confusion.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                tier.featured
                  ? "border-amber-300 bg-amber-50 shadow-md ring-1 ring-amber-200"
                  : "border-slate-200 bg-[#faf8f3]"
              }`}
            >
              <h3 className={cn("text-lg font-semibold", brandUi.heading)}>{tier.name}</h3>
              <p className={cn("mt-2 text-2xl font-semibold tracking-tight", brandUi.heading)}>{tier.price}</p>
              <p className={cn("mt-2 text-sm leading-6", brandUi.body)}>{tier.detail}</p>
              <ul className={cn("mt-6 flex-1 space-y-3 text-sm", brandUi.body)}>
                {tier.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9a6b1a]" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-slate-900 px-8 py-10 text-center text-white sm:px-12">
          <h3 className="text-xl font-semibold sm:text-2xl">Ready to start reciting?</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-300">
            Create your account, pick a teacher, and book your first class — learn Quran from anywhere today.
          </p>
          <Link href="/login?callbackUrl=%2Fstudents" className={cn("mt-6", brandUi.btnOnDark)}>
            Get started free
          </Link>
        </div>
      </div>
    </section>
  );
}
