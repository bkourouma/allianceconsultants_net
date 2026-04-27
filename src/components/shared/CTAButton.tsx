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

  const sizeClass =
    size === "sm"
      ? "cta-button--sm"
      : size === "lg"
        ? "cta-button--lg"
        : "cta-button--md";

  const variantClass =
    variant === "primary"
      ? onDark
        ? "cta-button--inverse-primary"
        : "slds-button_brand"
      : onDark
        ? "slds-button_inverse"
        : "slds-button_outline-brand";

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "slds-button cta-button",
        sizeClass,
        size === "sm" && "slds-button_small",
        variantClass,
        className,
      )}
    >
      {label}
    </a>
  );
}
