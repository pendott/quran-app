"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Teacher dashboard error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-slate-900">Teacher workspace could not load</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This is usually a database setup issue after a new deploy. On the server, run migrations then restart the
          app:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
          {`cd ~/projects/quran-app
git pull
docker compose exec web npx prisma migrate deploy
docker compose up -d --build --force-recreate web`}
        </pre>
        {error.digest ? (
          <p className="mt-4 text-xs text-slate-500">
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
            href="/login"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Sign in again
          </Link>
        </div>
      </div>
    </main>
  );
}
