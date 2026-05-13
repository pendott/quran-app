"use client";

import { useActionState } from "react";
import { purchasePackageForStudentAction } from "@/app/actions/package-purchase";
import { formatMYR } from "@/lib/format";
import type { BookingStudentOption } from "@/components/booking/family-booking-form";

type Pkg = {
  id: string;
  name: string;
  currency: string;
  price: unknown;
  sessionCredits: number | null;
};

type Props = {
  packages: Pkg[];
  students: BookingStudentOption[];
};

export function BuyPackagesSection({ packages, students }: Props) {
  const [state, formAction, pending] = useActionState(purchasePackageForStudentAction, {
    ok: false,
    error: null as string | null,
  });

  if (!packages.length || !students.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Buy a package</h3>
      <p className="text-xs leading-relaxed text-slate-500">
        Credits attach to the student you select. Parents choose a linked child; a student account only sees themselves. The payer is always whoever is signed in.
      </p>
      {state?.ok ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Package added to your account.
        </p>
      ) : null}
      {state && "error" in state && state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((pkg) => (
          <form
            key={pkg.id}
            action={formAction}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
          >
            <input type="hidden" name="packageId" value={pkg.id} />
            <div>
              <p className="font-semibold text-slate-900">{pkg.name}</p>
              <p className="text-sm text-slate-600">
                {formatMYR(pkg.price)} · {pkg.sessionCredits ?? 0} credits
              </p>
            </div>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Student</span>
              <select name="studentId" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayName}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-auto rounded-full bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
            >
              {pending ? "Processing…" : "Pay with manual provider (demo)"}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
