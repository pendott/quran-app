"use client";

import Link from "next/link";

export default function TeachApplyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-4 py-12">
      <div className="max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          The apply page hit an error. You can reload and try again. If submit keeps failing, use smaller photo files
          (photo under 2 MB, certificate under 5 MB).
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-slate-500">
            Reference: <code className="rounded bg-slate-100 px-1">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-[#c5a059] px-5 py-2.5 text-sm font-semibold text-slate-900"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
