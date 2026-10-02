"use client";

import Link from "next/link";
import { CTAButton } from "@/components/shared/CTAButton";
import { ReassuranceBadges } from "@/components/shared/ReassuranceBadges";
import type { Homepage } from "@/lib/validators/content";

interface HeroProps {
  hero: Homepage["hero"];
}

export function Hero({ hero }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-slate-950 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute inset-0 animate-hero-mesh opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 10%, rgba(59,130,246,0.55), transparent 70%), radial-gradient(50% 50% at 80% 30%, rgba(29,78,216,0.45), transparent 70%), radial-gradient(40% 40% at 60% 90%, rgba(245,158,11,0.18), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-32 lg:pt-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-light sm:text-sm">
            <span className="inline-block size-1.5 rounded-full bg-accent" />
            Solutions métiers africaines · depuis 2003
          </p>

          <h1
            id="hero-title"
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            {hero.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {hero.ctas.map((cta, i) => {
              if (cta.href) {
                return (
                  <Link
                    key={i}
                    href={cta.href}
                    className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-white/70 px-6 text-base font-semibold text-white transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
