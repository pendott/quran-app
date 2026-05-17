export const APP_NAME = "jomngaji.my";
export const APP_TAGLINE = "Quran recitations. Anytime, anywhere.";
export const APP_DESCRIPTION =
  "Learn Quran online with qualified teachers — book live classes, track tajwid progress, and recite from anywhere in Malaysia and beyond.";

/** High-contrast UI tokens (readable on cream backgrounds) */
export const brandUi = {
  heading: "text-slate-900",
  body: "text-slate-700",
  muted: "text-slate-600",
  accent: "text-[#9a6b1a]",
  link: "text-[#9a6b1a] font-semibold hover:text-[#7d5614] hover:underline",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#9a6b1a] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#9a6b1a]/30 transition hover:bg-[#7d5614] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a6b1a]",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-800 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800",
  btnOnDark:
    "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
  iconBox: "flex items-center justify-center rounded-xl bg-[#9a6b1a] text-white",
  sectionLabel: "text-sm font-semibold uppercase tracking-[0.2em] text-[#9a6b1a]",
} as const;
