import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const nav = [
  { href: "/#learn", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#0d4f4f]/10 bg-[color:var(--landing-bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Logo variant="full" className="max-w-[140px] sm:max-w-[180px]" />
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#0d4f4f]/80 transition hover:text-[#0d4f4f]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-[#0d4f4f] transition hover:bg-[#0d4f4f]/5 sm:px-4"
          >
            Sign in
          </Link>
          <Link
            href="/login?callbackUrl=%2Fstudents"
            className="rounded-full bg-[#0d4f4f] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#0d4f4f]/20 transition hover:bg-[#156b6b] sm:px-4"
          >
            Start learning
          </Link>
        </div>
      </div>
    </header>
  );
}
