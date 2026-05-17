"use client";

import { adminCancelBookingAction } from "@/app/actions/admin";

export function AdminCancelBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={adminCancelBookingAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
      >
        Cancel
      </button>
    </form>
  );
}
