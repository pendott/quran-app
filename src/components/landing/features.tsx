import { BookOpen, CreditCard, LineChart, Video } from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Progress that parents understand",
    body: "Surah, ayah, tajwid notes, homework, and next targets roll into a simple timeline after each class.",
  },
  {
    icon: Video,
    title: "Live classes and recordings",
    body: "Generate meeting links, mark attendance, and attach recordings so families can replay lessons safely.",
  },
  {
    icon: CreditCard,
    title: "Per session or packages",
    body: "Single lessons, 4- or 8-session bundles, and monthly plans with credits that booking logic can consume.",
  },
  {
    icon: LineChart,
    title: "Admin visibility",
    body: "Revenue, pending payments, teacher load, and attendance in one dashboard built for daily operations.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-slate-200/80 bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Features</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Everything you need to operate classes end to end
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          The product is designed around how Quran schools actually work: mixed ages, rotating teachers,
          package renewals, and parents who want clarity without spreadsheets.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 shadow-sm transition hover:border-teal-200/80 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
