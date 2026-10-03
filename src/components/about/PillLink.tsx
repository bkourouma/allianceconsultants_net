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
  "group/cta inline-flex items-center justify-center rounded-full font-bold no-underline transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)] active:translate-y-px";
const SIZE = {
  md: "h-12 pl-5 pr-1.5 text-[0.9375rem] gap-3",
  lg: "h-14 pl-7 pr-2 text-base gap-4",
};

function variantClasses(variant: "primary" | "secondary", onDark: boolean) {
  if (variant === "primary") {
    return onDark
      ? "bg-white text-ink hover:bg-enamel"
      : "bg-ink text-white hover:bg-night-2";
  }
  return onDark
    ? "bg-transparent text-white ring-2 ring-inset ring-white/70 hover:bg-white hover:text-ink"
    : "bg-transparent text-ink ring-2 ring-inset ring-ink hover:bg-ink hover:text-white";
}

/**
 * Ink pill link with a line-coloured arrow roundel. Same visual as CTAButton
 * but for arbitrary hrefs (CTAButton only builds /contact-demo URLs).
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
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
    >
      <ArrowRight className="size-4" strokeWidth={2} />
    </span>
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
