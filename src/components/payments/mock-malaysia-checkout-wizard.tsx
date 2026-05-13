"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  failMockMalaysiaPackagePaymentAction,
  finalizeMockMalaysiaPackagePaymentAction,
} from "@/app/actions/mock-malaysia-checkout";
import { formatMYR } from "@/lib/format";

type Method = "fpx" | "card" | "ewallet";

const BANKS = [
  { id: "maybank2u", label: "Maybank2u", short: "MBB" },
  { id: "cimb", label: "CIMB Clicks", short: "CIMB" },
  { id: "public", label: "Public Bank", short: "PBB" },
  { id: "rhb", label: "RHB Now", short: "RHB" },
  { id: "hlb", label: "Hong Leong Connect", short: "HLB" },
  { id: "ambank", label: "AmOnline", short: "AM" },
];

export type MockCheckoutInitial = {
  paymentId: string;
  billReference: string;
  packageName: string;
  studentName: string;
  amount: unknown;
};

export function MockMalaysiaCheckoutWizard(data: MockCheckoutInitial) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method>("fpx");
  const [bankId, setBankId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState<"idle" | "success" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 4 || !processing || outcome !== "idle") return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      if (cancelled) return;
      const res = await finalizeMockMalaysiaPackagePaymentAction(data.paymentId);
      if (cancelled) return;
      setProcessing(false);
      if (res.ok) {
        setOutcome("success");
        setStep(5);
        router.refresh();
        return;
      }
      if (res.error === "aborted") return;
      setOutcome("failed");
      setError(res.error ?? "Payment failed");
      setStep(5);
    }, 2800);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [step, processing, outcome, data.paymentId, router]);

  function goAuthorize() {
    if (method === "fpx" && !bankId) {
      setError("Sila pilih bank / Please select your bank.");
      return;
    }
    setError(null);
    setStep(4);
    setProcessing(true);
  }

  async function declineBeforeBank() {
    setError(null);
    const res = await failMockMalaysiaPackagePaymentAction(data.paymentId);
    if (!res.ok) {
      setError(res.error ?? "Could not cancel");
      return;
    }
    router.refresh();
    setOutcome("failed");
    setError("Mock: payment cancelled before authorization (e.g. user closed FPX).");
    setStep(5);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl shadow-slate-900/10">
        <header className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-5 py-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-100">Demo bayaran</p>
          <h1 className="mt-1 text-lg font-bold tracking-tight">Mock Malaysia checkout (FPX-style)</h1>
          <p className="mt-1 text-xs text-emerald-100">Not a real bank — mimics Billplz / FPX-style steps for demos.</p>
        </header>

        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <ol className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
            {[
              "1 Semak",
              "2 Kaedah",
              "3 FPX / Sahkan",
              "4 Memproses",
              "5 Hasil",
            ].map((label, i) => (
              <li
                key={label}
                className={
                  step > i + 1
                    ? "text-emerald-700"
                    : step === i + 1
                      ? "font-semibold text-slate-900"
                      : "text-slate-400"
                }
              >
                {label}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4 px-5 py-6">
          {step === 1 ? (
            <>
              <h2 className="text-sm font-semibold text-slate-900">Semak pesanan / Order summary</h2>
              <dl className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">No. rujukan / Bill ID</dt>
                  <dd className="font-mono text-xs text-slate-800">{data.billReference}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Pakej / Package</dt>
                  <dd className="text-right font-medium text-slate-900">{data.packageName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Pelajar / Student</dt>
                  <dd className="text-right text-slate-800">{data.studentName}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <dt className="font-medium text-slate-700">Jumlah (MYR) / Total</dt>
                  <dd className="text-lg font-bold text-emerald-800">{formatMYR(data.amount)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600"
              >
                Teruskan / Continue
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="text-sm font-semibold text-slate-900">Kaedah bayaran / Payment method</h2>
              <div className="flex rounded-xl border border-slate-200 p-1 text-xs font-semibold">
                {(
                  [
                    ["fpx", "FPX"],
                    ["card", "Kad / Card"],
                    ["ewallet", "eWallet"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setMethod(id);
                      setBankId(null);
                    }}
                    className={
                      method === id
                        ? "flex-1 rounded-lg bg-emerald-700 py-2 text-white"
                        : "flex-1 rounded-lg py-2 text-slate-600 hover:bg-slate-50"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                In production, FPX redirects to PayNet or a PSP (Billplz, ToyyibPay, SenangPay). Cards use 3DS; eWallets
                use app-to-app or QRIS.
              </p>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Teruskan / Continue
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-600 underline">
                Kembali / Back
              </button>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="text-sm font-semibold text-slate-900">
                {method === "fpx" ? "Pilih bank FPX / Select bank" : "Sahkan / Confirm (demo)"}
              </h2>
              {method === "fpx" ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BANKS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBankId(b.id)}
                      className={
                        bankId === b.id
                          ? "rounded-xl border-2 border-emerald-600 bg-emerald-50 px-3 py-3 text-left text-sm font-semibold text-emerald-900"
                          : "rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-800 hover:border-slate-300"
                      }
                    >
                      <span className="block text-xs text-slate-500">{b.short}</span>
                      {b.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {method === "card" ? (
                    <p>
                      <strong>Kad debit / kredit:</strong> demo only — no PAN or CVV. Live flow would collect card on
                      PCI-compliant fields or redirect to ACS 3-D Secure.
                    </p>
                  ) : (
                    <p>
                      <strong>eWallet:</strong> demo only — TnG, GrabPay, or ShopeePay would open the issuer app or show
                      QRIS here.
                    </p>
                  )}
                </div>
              )}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="button"
                onClick={goAuthorize}
                className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                {method === "fpx" ? "Log masuk ke bank / Continue to bank (mock)" : "Bayar / Pay (mock)"}
              </button>
              <button
                type="button"
                onClick={() => void declineBeforeBank()}
                className="w-full rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-800 hover:bg-red-100"
              >
                Demo: batalkan / Cancel before bank
              </button>
              <button type="button" onClick={() => setStep(2)} className="w-full text-sm text-slate-600 underline">
                Kembali / Back
              </button>
            </>
          ) : null}

          {step === 4 && processing ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
              <p className="text-sm font-semibold text-slate-900">Menghubungi bank simulasi…</p>
              <p className="mt-1 text-xs text-slate-500">Contacting simulated FPX host (like PayNet redirect)…</p>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4 text-center">
              {outcome === "success" ? (
                <>
                  <p className="text-3xl" aria-hidden>
                    ✓
                  </p>
                  <p className="text-sm font-semibold text-emerald-800">Bayaran berjaya / Payment successful</p>
                  <p className="text-xs text-slate-500">Package credits are now on the student account.</p>
                </>
              ) : (
                <>
                  <p className="text-3xl" aria-hidden>
                    ✕
                  </p>
                  <p className="text-sm font-semibold text-red-800">Tidak berjaya / Unsuccessful</p>
                  <p className="text-xs text-slate-600">{error ?? "No charge was completed."}</p>
                </>
              )}
              <Link
                href="/students/payments"
                className="inline-flex w-full justify-center rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Kembali ke pembayaran / Back to payments
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
