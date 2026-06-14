import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#0d4f4f]/10 bg-[#0d4f4f] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo variant="full" surface="pill" href="/" className="max-w-[140px]" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">{APP_TAGLINE}</p>
        </div>
        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="font-semibold text-[#c5a059]">Learn</p>
            <ul className="mt-3 space-y-2 text-white/75">
              <li>
                <Link href="/#learn" className="hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#c5a059]">Account</p>
            <ul className="mt-3 space-y-2 text-white/75">
              <li>
                <Link href="/register" className="hover:text-white">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/login?callbackUrl=%2Fstudents" className="hover:text-white">
                  Learning portal
                </Link>
              </li>
              <li>
                <Link href="/teach/apply" className="hover:text-white">
                  Teacher
                </Link>
              </li>
              <li>
                <Link href="/login?callbackUrl=%2Fadmin" className="hover:text-white">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
