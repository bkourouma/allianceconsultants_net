"use client";

import { useEffect, useRef } from "react";
import { CTAButton } from "@/components/shared/CTAButton";
import { ReassuranceBadges } from "@/components/shared/ReassuranceBadges";
import { trackEvent } from "@/lib/matomo";
import type { Homepage } from "@/lib/validators/content";
import Link from "next/link";

interface HeroProps {
  hero: Homepage["hero"];
}

export function Hero({ hero }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let fired50 = false;
    let fired100 = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const ratio = entry.intersectionRatio;
          if (ratio >= 0.5 && !fired50) {
            fired50 = true;
            trackEvent("Hero", "ScrollDepth", "50%");
          }
          if (ratio >= 1 && !fired100) {
            fired100 = true;
            trackEvent("Hero", "ScrollDepth", "100%");
          }
        }
      },
      { threshold: [0.5, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[var(--color-dark)] text-white"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, var(--color-primary-light), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-title"
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {hero.ctas.map((cta, i) => {
              if (cta.href) {
                return (
                  <Link
                    key={i}
                    href={cta.href}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white hover:text-[var(--color-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-dark)]"
                  >
                    {cta.label}
                  </Link>
                );
              }
              return (
                <CTAButton
                  key={i}
                  intent={cta.intent!}
                  label={cta.label}
                  block="hero"
                  size="lg"
                  className={
                    i === 0
                      ? "bg-white text-[var(--color-dark)] hover:bg-gray-100 focus-visible:ring-white"
                      : "border-2 border-white bg-transparent text-white hover:bg-white hover:text-[var(--color-dark)]"
                  }
                />
              );
            })}
          </div>

          <ReassuranceBadges badges={hero.reassuranceBadges} />
        </div>
      </div>
    </section>
  );
}
