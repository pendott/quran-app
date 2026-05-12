import Link from "next/link";

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
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/";
  const signInHref = `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 md:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
      <section className="rounded-[36px] border border-slate-200/80 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/15 md:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-teal-200">Role-based authentication</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Secure access for every role</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Auth.js is wired with Prisma and credentials-based sign in. After you push the schema and seed your
          first users, this flow will route each user to the correct workspace.
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
        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Initial setup</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Open the secure sign-in flow</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          This phase scaffolds the auth structure. Once the database is connected, create your admin, teacher,
          and family accounts with password hashes, then use the Auth.js sign-in endpoint below.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={signInHref}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Continue to sign in
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to overview
          </Link>
        </div>
        <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          Keep all provider keys server-side in environment variables. Never expose Zoom, WhatsApp, email, or
          payment secrets in client components.
        </div>
      </section>
    </main>
  );
}
