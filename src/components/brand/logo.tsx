import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

type LogoProps = {
  /** Compact mark for nav bars */
  variant?: "full" | "mark";
  className?: string;
  href?: string;
};

const sizes = {
  full: { width: 200, height: 72, className: "h-14 w-auto sm:h-16" },
  mark: { width: 44, height: 44, className: "h-9 w-9 sm:h-10 sm:w-10" },
} as const;

export function Logo({ variant = "full", className = "", href = "/" }: LogoProps) {
  const { width, height, className: sizeClass } = sizes[variant];

  const img = (
    <Image
      src="/logo.png"
      alt={APP_NAME}
      width={width}
      height={height}
      className={`object-contain object-left ${sizeClass} ${className}`}
      priority={variant === "full"}
    />
  );

  if (!href) return img;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d4f4f]">
      {img}
    </Link>
  );
}
