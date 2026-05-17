"use client";

import { adminMarkPaymentPaidAction } from "@/app/actions/admin";

export function AdminMarkPaidButton({ paymentId }: { paymentId: string }) {
  return (
    <form action={adminMarkPaymentPaidAction}>
      <input type="hidden" name="paymentId" value={paymentId} />
      <button
        type="submit"
        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
      >
        Mark paid
      </button>
    </form>
  );
}
