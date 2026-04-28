"use client";

import { trackEvent } from "@/lib/matomo";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

type Intent = "demo" | "contact" | "training" | "automation" | "diagnostic";
type Block =
  | "hero"
  | "solution-card"
  | "ai-section"
  | "service-card"
  | "training-section"
  | "final-cta";
type MatomoCategory =
  | "Hero"
  | "Solutions"
  | "IA"
  | "Services"
  | "Trainings"
  | "FinalCTA";

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

const BLOCK_CATEGORY_MAP: Record<Block, MatomoCategory> = {
  hero: "Hero",
  "solution-card": "Solutions",
  "ai-section": "IA",
  "service-card": "Services",
  "training-section": "Trainings",
  "final-cta": "FinalCTA",
};

const BASE =
  "inline-flex items-center justify-center rounded-lg font-semibold no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary";

const SIZE: Record<NonNullable<CTAButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

function variantClasses(
  variant: NonNullable<CTAButtonProps["variant"]>,
  onDark: boolean,
): string {
  if (variant === "primary") {
    return onDark
      ? "bg-white text-primary hover:bg-slate-100 shadow-sm"
      : "bg-primary text-white hover:bg-primary-dark shadow-sm";
  }
  return onDark
    ? "border-2 border-white/80 text-white hover:bg-white hover:text-primary focus-visible:ring-white"
    : "border-2 border-primary text-primary hover:bg-primary hover:text-white";
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

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    const category = BLOCK_CATEGORY_MAP[block];
    const action = "ClickCTA";
    const name = solutionSlug ? `${intent}:${solutionSlug}` : intent;
    trackEvent(category, action, name);
    (e.currentTarget as HTMLAnchorElement).dataset.tracked = "true";
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(BASE, SIZE[size], variantClasses(variant, onDark), className)}
    >
      {label}
    </a>
  );
}
