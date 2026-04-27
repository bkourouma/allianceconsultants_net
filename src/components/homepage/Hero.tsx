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
      className="hero-section"
      aria-labelledby="hero-title"
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, var(--color-primary-light), transparent)",
        }}
      />

      <div className="slds-container_x-large slds-container_center slds-p-horizontal_medium slds-p-vertical_xx-large">
        <div className="hero-section__center">
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
                    className="slds-button cta-button cta-button--lg slds-button_inverse"
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
                  variant={i === 0 ? "primary" : "secondary"}
                  onDark
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
