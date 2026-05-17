import Link from "next/link";
import { ArrowRight, Globe, Headphones, Video } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE } from "@/lib/brand";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_70%_0%,rgba(197,160,89,0.18),transparent),radial-gradient(ellipse_60%_50%_at_10%_20%,rgba(13,79,79,0.1),transparent)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0d4f4f]">
            <Globe className="h-3.5 w-3.5 text-[#c5a059]" aria-hidden />
            {APP_TAGLINE}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-[#0d4f4f] sm:text-5xl lg:text-[3.25rem]">
            Learn Quran from{" "}
            <span className="text-[#c5a059]">anywhere</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#0d4f4f]/75">
            Book live classes with qualified teachers, join on Zoom from home or on the go, and follow your tajwid and
            memorisation progress — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login?callbackUrl=%2Fstudents"
              className="inline-flex items-center gap-2 rounded-full bg-[#0d4f4f] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0d4f4f]/25 transition hover:bg-[#156b6b]"
            >
              Start learning today
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login?callbackUrl=%2Fteacher"
              className="inline-flex items-center gap-2 rounded-full border border-[#0d4f4f]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#0d4f4f] shadow-sm transition hover:border-[#0d4f4f]/35 hover:bg-[#faf8f3]"
            >
              I&apos;m a teacher
            </Link>
          </div>
          <ul className="mt-10 flex flex-col gap-3 text-sm text-[#0d4f4f]/80 sm:flex-row sm:flex-wrap sm:gap-x-8">
            <li className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#c5a059]" aria-hidden />
              Live online classes with Zoom
            </li>
            <li className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-[#c5a059]" aria-hidden />
              Tajwid, recitation &amp; memorisation
            </li>
          </ul>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:max-w-none lg:justify-self-end">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059]/25 via-[#faf8f3] to-[#0d4f4f]/15 blur-2xl"
          />
          <div className="relative flex flex-col items-center">
            <Logo variant="full" surface="card" href={null} className="mx-auto" />
            <p className="mt-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-[#0d4f4f]/60">
              Trusted online Quran learning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
