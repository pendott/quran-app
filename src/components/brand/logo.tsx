import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** How the logo sits on the page background */
export type LogoSurface = "transparent" | "cream" | "card" | "pill";

type LogoProps = {
  variant?: "full" | "mark";
  surface?: LogoSurface;
  className?: string;
  /** Omit or pass `null` to render without a link wrapper */
  href?: string | null;
};

const sources: Record<LogoSurface, string> = {
  transparent: "/logo.png",
  cream: "/logo-cream.png",
  card: "/logo-card.png",
  pill: "/logo.png",
};

const sizes = {
  full: { width: 200, height: 200, className: "h-14 w-auto sm:h-16" },
  mark: { width: 44, height: 44, className: "h-9 w-9 sm:h-10 sm:w-10" },
} as const;

const pillClass =
  "inline-flex rounded-2xl bg-[#faf8f3] p-3 shadow-md shadow-black/10 ring-1 ring-[#c5a059]/25";

export function Logo({ variant = "full", surface = "transparent", className = "", href = "/" }: LogoProps) {
  const { width, height, className: sizeClass } = sizes[variant];
  const src = sources[surface];
  const isCard = surface === "card";

  const img = (
    <Image
      src={src}
      alt={APP_NAME}
      width={isCard ? 560 : width}
      height={isCard ? 560 : height}
      className={cn(
        "object-contain object-left",
        isCard ? "h-auto w-full max-w-[340px] sm:max-w-[380px]" : sizeClass,
        className,
      )}
      priority={variant === "full"}
    />
  );

  const content = surface === "pill" ? <span className={pillClass}>{img}</span> : img;

  if (href === null) return content;

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d4f4f]"
    >
      {content}
    </Link>
  );
}
