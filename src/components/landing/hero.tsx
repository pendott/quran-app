import Link from "next/link";
import { ArrowRight, Globe, Headphones, Video } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { APP_TAGLINE, brandUi } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_70%_0%,rgba(197,160,89,0.18),transparent),radial-gradient(ellipse_60%_50%_at_10%_20%,rgba(13,79,79,0.1),transparent)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-[#c5a059]/50 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
              brandUi.accent,
            )}
          >
            <Globe className="h-3.5 w-3.5" aria-hidden />
            {APP_TAGLINE}
          </p>
          <h1 className={cn("mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]", brandUi.heading)}>
            Learn Quran from{" "}
            <span className="text-[#9a6b1a]">anywhere</span>
          </h1>
          <p className={cn("mt-5 max-w-xl text-lg leading-8", brandUi.body)}>
            Book live classes with qualified teachers, join on Zoom from home or on the go, and follow your tajwid and
            memorisation progress — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login?callbackUrl=%2Fstudents" className={brandUi.btnPrimary}>
              Start learning today
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/login?callbackUrl=%2Fteacher" className={brandUi.btnSecondary}>
              I&apos;m a teacher
            </Link>
          </div>
          <ul className={cn("mt-10 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8", brandUi.muted)}>
            <li className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#9a6b1a]" aria-hidden />
              Live online classes with Zoom
            </li>
            <li className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-[#9a6b1a]" aria-hidden />
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
            <p className={cn("mt-4 text-center text-sm font-medium uppercase tracking-[0.2em]", brandUi.muted)}>
              Trusted online Quran learning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
