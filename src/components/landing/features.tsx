import { BookOpen, Calendar, MapPin, Video } from "lucide-react";

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
    <section id="features" className="scroll-mt-24 border-t border-[#0d4f4f]/10 bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c5a059]">Why jomngaji.my</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#0d4f4f] sm:text-4xl">
          Everything you need to learn Quran online
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#0d4f4f]/70">
          Whether you are starting tajwid, strengthening recitation, or memorising — connect with teachers and stay on
          track without leaving home.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#0d4f4f]/10 bg-[#faf8f3] p-6 shadow-sm transition hover:border-[#c5a059]/40 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d4f4f] text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#0d4f4f]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#0d4f4f]/70">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
