"use client";

import { cn } from "@/lib/utils";

type Intent = "demo" | "contact" | "training" | "automation" | "diagnostic";
type Block =
  | "hero"
  | "solution-card"
  | "ai-section"
  | "service-card"
  | "training-section"
  | "final-cta";

interface CTAButtonProps {
  intent: Intent;
  label: string;
  solutionSlug?: string;
  block: Block;
  /** @deprecated tracking origin; defaulted to "homepage". Slated for removal once tracking is centralized. */
  from?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  /** When the button sits on a dark or brand-color background, switches to inverse styling. */
  onDark?: boolean;
  className?: string;
}

const BASE =
  "group/cta inline-flex items-center justify-center rounded-[3px] font-display font-bold uppercase no-underline tracking-[0.06em] transition-[background-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] active:translate-y-[2px] active:shadow-none";

const SIZE: Record<NonNullable<CTAButtonProps["size"]>, string> = {
  sm: "h-11 px-4 text-[0.9375rem] gap-2",
  md: "h-12 px-6 text-[1.0625rem] gap-2.5",
  lg: "h-14 px-8 text-[1.25rem] gap-3",
};

function variantClasses(
  variant: NonNullable<CTAButtonProps["variant"]>,
  onDark: boolean,
): string {
  if (variant === "primary") {
    // The red stub: the one primary action of the site.
    return "bg-red text-white shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] hover:bg-red-dk";
  }
  return onDark
    ? "bg-transparent text-white ring-2 ring-inset ring-white/80 hover:bg-white hover:text-ink"
    : "bg-transparent text-ink ring-2 ring-inset ring-ink hover:bg-ink hover:text-white";
}

export function CTAButton({
  intent,
  label,
  solutionSlug,
  block,
  from = "homepage",
  variant = "primary",
  size = "md",
  onDark = false,
  className,
}: CTAButtonProps) {
  const params = new URLSearchParams({ intent, from, block });
  if (solutionSlug) params.set("solution", solutionSlug);

  const href = `/contact-demo?${params.toString()}`;

  return (
    <a
      href={href}
      className={cn(BASE, SIZE[size], variantClasses(variant, onDark), className)}
    >
      {label}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 8h11M9.5 4l4 4-4 4" />
      </svg>
    </a>
  );
}
