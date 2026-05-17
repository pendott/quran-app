import type { TimelineItem } from "@/lib/types";

type ProgressTimelineProps = {
  items: TimelineItem[];
};

export function ProgressTimeline({ items }: ProgressTimelineProps) {
  return (
    <ol className="space-y-5">
      {items.map((item) => (
        <li key={item.meta} className="relative pl-8">
          <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[#9a6b1a]" />
          <span className="absolute left-[5px] top-5 h-[calc(100%-8px)] w-px bg-slate-200" />
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              {item.meta}
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
