import type { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-200/90">{children}</div>;
}
