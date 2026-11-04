import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onDark?: boolean;
  size?: "md" | "lg";
  /** Disable client routing (for tel:, mailto:, external). */
  plain?: boolean;
  className?: string;
}

const BASE =
  "group/cta inline-flex items-center justify-center rounded-[3px] font-display font-bold uppercase no-underline tracking-[0.06em] transition-[background-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] active:translate-y-[2px] active:shadow-none";
const SIZE = {
  md: "min-h-12 px-6 py-2 text-[1.0625rem] gap-2.5",
  lg: "min-h-14 px-8 py-2 text-[1.25rem] gap-3",
};

function variantClasses(variant: "primary" | "secondary", onDark: boolean) {
  if (variant === "primary") {
    // The red stub: same material as CTAButton.
    return "bg-red text-white shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] hover:bg-red-dk";
  }
  return onDark
    ? "bg-transparent text-white ring-2 ring-inset ring-white/80 hover:bg-white hover:text-ink"
    : "bg-transparent text-ink ring-2 ring-inset ring-ink hover:bg-ink hover:text-white";
}

/**
 * Link styled as a coupon stub, for arbitrary hrefs (CTAButton only builds
 * /contact-demo URLs). `primary` is the red stub, `secondary` the outlined one.
 */
export function PillLink({
  href,
  children,
  variant = "primary",
  onDark = false,
  size = "md",
  plain = false,
  className,
}: PillLinkProps) {
  const cls = cn(BASE, SIZE[size], variantClasses(variant, onDark), className);
  const arrow = (
    <ArrowRight
      aria-hidden
      className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
      strokeWidth={2.25}
    />
  );
  if (plain) {
    return (
      <a href={href} className={cls}>
        {children}
        {arrow}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}
