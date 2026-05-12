import type { Stat } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneClasses: Record<NonNullable<Stat["tone"]>, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/10",
};

export function StatCard({ label, value, change, tone = "sky" }: Stat) {
  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/5">
      <div
        className={cn(
          "mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
          toneClasses[tone],
        )}
      >
        {label}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{change}</p>
    </article>
  );
}
