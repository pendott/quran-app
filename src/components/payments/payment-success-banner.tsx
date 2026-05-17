type Props = { show: boolean; message?: string };

export function PaymentSuccessBanner({
  show,
  message = "Payment received. Your booking or package credits will update shortly.",
}: Props) {
  if (!show) return null;
  return (
    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      {message}
    </p>
  );
}
