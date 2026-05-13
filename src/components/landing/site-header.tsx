import Link from "next/link";

const nav = [
  { href: "/#features", label: "Features" },
  { href: "/#for-schools", label: "For schools" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[color:var(--landing-bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
            QC
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            Quran Class
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:px-4"
          >
            Sign in
          </Link>
          <Link
            href="/login?callbackUrl=%2Fstudents"
            className="rounded-full bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/25 transition hover:bg-teal-500 sm:px-4"
          >
            Book a class
          </Link>
        </div>
      </div>
    </header>
  );
}
