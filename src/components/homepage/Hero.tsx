import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { ReassuranceBadges } from "@/components/shared/ReassuranceBadges";
import { NetworkMap } from "@/components/network/NetworkMap";
import type { Homepage } from "@/lib/validators/content";

interface HeroProps {
  hero: Homepage["hero"];
}

/**
 * First viewport: display headline, one lead sentence, the demo CTA, and the
 * interactive network map (the product explained as a transit diagram).
 */
export function Hero({ hero }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-x-clip pb-10 pt-5 sm:pt-7 lg:pb-12 lg:pt-6"
    >
      <div className="wrap">
        <h1
          id="hero-title"
          className="font-display text-[clamp(2.05rem,1rem+3.3vw,3.25rem)] leading-[1.03] font-extrabold tracking-[-0.03em] text-balance text-ink"
        >
          {hero.title}
        </h1>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
          <div>
            <p className="max-w-[62ch] text-[1.0625rem] leading-[1.5] text-pretty text-ink-soft lg:text-[1.125rem]">
              {hero.subtitle}
            </p>
            <ReassuranceBadges badges={hero.reassuranceBadges} className="mt-3" />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {hero.ctas.map((cta, i) =>
              cta.href ? (
                <Link
                  key={i}
                  href={cta.href}
                  className="group/more inline-flex min-h-12 items-center gap-2 text-[0.9375rem] font-bold text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ink"
                >
                  {cta.label}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/more:translate-x-0.5"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              ) : (
                <CTAButton
                  key={i}
                  intent={cta.intent!}
                  label={cta.label}
                  block="hero"
                  size="lg"
                  variant={i === 0 ? "primary" : "secondary"}
                />
              ),
            )}
          </div>
        </div>

        <NetworkMap className="mt-6 lg:mt-5" />
      </div>
    </section>
  );
}
