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
  "group/cta inline-flex items-center justify-center rounded-full font-bold no-underline transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:translate-y-px";

const SIZE: Record<NonNullable<CTAButtonProps["size"]>, string> = {
  sm: "h-9 pl-4 pr-1.5 text-sm gap-2",
  md: "h-11 pl-5 pr-1.5 text-[0.9375rem] gap-3",
  lg: "h-14 pl-7 pr-2 text-base gap-4",
};

function variantClasses(
  variant: NonNullable<CTAButtonProps["variant"]>,
  onDark: boolean,
): string {
  if (variant === "primary") {
    return onDark
      ? "bg-white text-ink hover:bg-enamel"
      : "bg-ink text-white hover:bg-night-2";
  }
  return onDark
    ? "bg-transparent text-white ring-2 ring-inset ring-white/70 hover:bg-white hover:text-ink"
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
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5 group-hover/cta:rotate-[-8deg]"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
      </span>
    </a>
  );
}
