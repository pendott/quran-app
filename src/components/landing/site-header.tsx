import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { brandUi } from "@/lib/brand";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/#learn", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[color:var(--landing-bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Logo variant="full" surface="transparent" className="max-w-[140px] sm:max-w-[180px]" />
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("text-sm font-medium transition hover:text-slate-900", brandUi.muted)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={cn("rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 sm:px-4", brandUi.heading)}
          >
            Sign in
          </Link>
          <Link
            href="/login?callbackUrl=%2Fstudents"
            className={cn("rounded-full px-3 py-2 sm:px-4", brandUi.btnPrimary)}
          >
            Start learning
          </Link>
        </div>
      </div>
    </header>
  );
}
