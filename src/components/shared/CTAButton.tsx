"use client";

import { trackEvent } from "@/lib/matomo";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

type Intent = "demo" | "contact" | "training" | "automation" | "diagnostic";
type Block = "hero" | "solution-card" | "ai-section" | "service-card" | "training-section" | "final-cta";
type MatomoCategory = "Hero" | "Solutions" | "IA" | "Services" | "Trainings" | "FinalCTA";

interface CTAButtonProps {
  intent: Intent;
  label: string;
  solutionSlug?: string;
  block: Block;
  from?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Override href entirely (e.g. external URL) */
  href?: string;
  external?: boolean;
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
  className,
  href: overrideHref,
  external = false,
}: CTAButtonProps) {
  const params = new URLSearchParams({ intent, from, block });
  if (solutionSlug) params.set("solution", solutionSlug);

  const href = overrideHref ?? `/contact-demo?${params.toString()}`;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Allow default navigation — Matomo queues event before unload
    const category = BLOCK_CATEGORY_MAP[block];
    const action = "ClickCTA";
    const name = solutionSlug ? `${intent}:${solutionSlug}` : intent;
    trackEvent(category, action, name);
    // Prevent duplicate tracking attribute
    (e.currentTarget as HTMLAnchorElement).dataset.tracked = "true";
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]"
          : "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus-visible:ring-[var(--color-primary)]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-6 py-3 text-base",
        size === "lg" && "px-8 py-4 text-lg",
        className
      )}
    >
      {label}
    </a>
  );
}
