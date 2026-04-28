import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Homepage } from "@/lib/validators/content";

interface AISectionProps {
  aiSection: Homepage["aiSection"];
}

export function AISection({ aiSection }: AISectionProps) {
  return (
    <Section bg="dark" aria-labelledby="ai-section-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">
            <span className="inline-block size-1.5 rounded-full bg-accent" />
            IA &amp; Automatisation
          </p>
          <h2
            id="ai-section-title"
            className="mt-4 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {aiSection.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Nos experts conçoivent et déploient des automatisations sur mesure
            adaptées à vos processus métiers et à votre secteur d&apos;activité.
          </p>
          <div className="mt-8">
            <CTAButton
              intent="automation"
              label={aiSection.ctaLabel}
              block="ai-section"
              size="lg"
              onDark
            />
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary-light/30 via-primary/20 to-transparent blur-2xl"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-1.5 pb-5">
              <span className="size-2.5 rounded-full bg-rose-400/70" />
              <span className="size-2.5 rounded-full bg-amber-300/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
                workflow.ia
              </span>
            </div>
            <ul
              className="space-y-3.5"
              aria-label="Capacités IA d'Alliance Consultants"
            >
              {aiSection.bullets.map((bullet, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-light/15 text-[10px] font-bold text-primary-light"
                  >
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-slate-200">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
