"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  children: ReactNode;
};

export function DashboardShell({ navItems, roleLabel, userName, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-lg font-semibold text-white">
              QR
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-teal-200">Quran SaaS</p>
              <p className="text-lg font-semibold">Class management</p>
            </div>
          </Link>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Signed in as</p>
            <p className="mt-2 text-base font-semibold">{userName}</p>
            <p className="mt-1 text-sm text-slate-300">{roleLabel} workspace</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-[22px] px-4 py-3 transition",
                    isActive ? "bg-white text-slate-950" : "bg-white/0 text-slate-200 hover:bg-white/8",
                  )}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className={cn("mt-1 text-xs leading-5", isActive ? "text-slate-500" : "text-slate-400")}>
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-[32px] border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-950/5 backdrop-blur md:p-6 xl:p-8">
          <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-teal-700">Modern SaaS foundation</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Quran Reciting Class Management System</h1>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
              Clean layout, role-aware routing, Prisma-ready schema
            </div>
          </div>
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
