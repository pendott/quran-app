import { BookOpen, Calendar, MapPin, Video } from "lucide-react";
import { brandUi } from "@/lib/brand";
import { cn } from "@/lib/utils";

const items = [
  {
    icon: MapPin,
    title: "Learn from anywhere",
    body: "Home, office, or travelling — book a slot that fits your timezone and join your teacher online in seconds.",
  },
  {
    icon: Video,
    title: "Live one-to-one classes",
    body: "Face-to-face recitation with qualified ustaz and ustazah via Zoom, with meeting links ready when class starts.",
  },
  {
    icon: BookOpen,
    title: "Track your progress",
    body: "Surah, ayah, tajwid notes, and homework after every lesson so parents and students always know what to practise.",
  },
  {
    icon: Calendar,
    title: "Flexible scheduling",
    body: "Pick teachers who match your level, book per session or save with packages, and get reminders before each class.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-t border-slate-200/80 bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className={brandUi.sectionLabel}>Why jomngaji.my</p>
        <h2 className={cn("mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl", brandUi.heading)}>
          Everything you need to learn Quran online
        </h2>
        <p className={cn("mt-4 max-w-2xl text-base leading-7", brandUi.body)}>
          Whether you are starting tajwid, strengthening recitation, or memorising — connect with teachers and stay on
          track without leaving home.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-[#faf8f3] p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
            >
              <div className={cn(brandUi.iconBox, "h-10 w-10")}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className={cn("mt-4 text-base font-semibold", brandUi.heading)}>{title}</h3>
              <p className={cn("mt-2 text-sm leading-6", brandUi.body)}>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
