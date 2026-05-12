import Link from "next/link";

const roleHighlights = [
  {
    title: "Admin command center",
    description: "Track students, teachers, revenue, pending payments, reports, pricing, recordings, and cancellation rules.",
  },
  {
    title: "Teacher teaching cockpit",
    description: "See today’s schedule, start classes, open meeting links, write Quran notes, and review student history.",
  },
  {
    title: "Student and parent portal",
    description: "Book available slots, pay with single sessions or packages, join classes, replay recordings, and follow progress timelines.",
  },
];

const automationFlow = [
  "Check teacher availability and reserve the slot.",
  "Charge a payment or consume package credit.",
  "Create the meeting link and save it to the session record.",
  "Queue email and WhatsApp reminders at 24h, 1h, and 10m before class.",
  "Persist teacher notes, recordings, and post-class summary delivery.",
];

const infraRecommendations = [
  {
    label: "Unraid app server",
    value: "Next.js standalone container behind Nginx Proxy Manager or Caddy",
  },
  {
    label: "Unraid database",
    value: "PostgreSQL 16 container with a persistent Docker volume",
  },
  {
    label: "Future add-ons",
    value: "Redis for queued reminders and MinIO or S3-compatible storage for recordings",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-8 md:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-950/15 md:px-10 md:py-14">
        <p className="text-sm uppercase tracking-[0.28em] text-teal-200">Modern SaaS foundation</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
          Quran Reciting Class Management System
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
          A scalable Next.js, Prisma, and PostgreSQL foundation for booking Quran recitation classes,
          handling package payments, running live online sessions, saving recordings, and tracking progress.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
          >
            Open auth flow
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8"
          >
            Preview protected dashboards
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {roleHighlights.map((item) => (
          <article key={item.title} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/5">
            <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/5 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">Booking automation</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Core workflow prepared for integrations</h2>
          <ol className="mt-6 space-y-4">
            {automationFlow.map((step, index) => (
              <li key={step} className="flex gap-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-slate-600">{step}</p>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/5 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">Unraid recommendation</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Docker stack to start with</h2>
          <dl className="mt-6 space-y-5">
            {infraRecommendations.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
                <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</dt>
                <dd className="mt-2 text-sm leading-7 text-slate-600">{item.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>
    </main>
  );
}
