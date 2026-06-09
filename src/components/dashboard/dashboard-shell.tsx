"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutToHome } from "@/lib/auth-sign-out";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { APP_NAME } from "@/lib/brand";
import { getActiveNavHref } from "@/lib/navigation";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  workspaceTitle: string;
  workspaceTagline: string;
  children: ReactNode;
};

const navTitleColor = (isActive: boolean) => (isActive ? "#020617" : "#ffffff");
const navDescColor = (isActive: boolean) => (isActive ? "#475569" : "#cbd5e1");

export function DashboardShell({
  navItems,
  roleLabel,
  userName,
  workspaceTitle,
  workspaceTagline,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const activeHref = getActiveNavHref(pathname, navItems);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-[#0d4f4f]/20 bg-[#0d4f4f] p-6 shadow-xl shadow-[#0d4f4f]/20">
          <Link href="/" className="block">
            <Logo variant="full" surface="pill" className="max-w-[160px]" />
          </Link>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Signed in as</p>
            <p className="mt-2 text-base font-semibold text-white">{userName}</p>
            <p className="mt-1 text-sm text-slate-300">{roleLabel} workspace</p>
            <button
              type="button"
              onClick={() => void signOutToHome()}
              className="mt-4 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Sign out
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-[22px] px-4 py-3 transition",
                    isActive ? "bg-white shadow-sm" : "hover:bg-white/10",
                  )}
                >
                  <span
                    className="block text-sm font-bold"
                    style={{ color: navTitleColor(isActive) }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="mt-1 block text-xs leading-5"
                    style={{ color: navDescColor(isActive) }}
                  >
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-[32px] border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-950/5 backdrop-blur md:p-6 xl:p-8">
          <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-teal-700">{workspaceTitle}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{workspaceTagline}</h1>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0d4f4f] ring-1 ring-slate-200">
              {APP_NAME}
            </div>
          </div>
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
