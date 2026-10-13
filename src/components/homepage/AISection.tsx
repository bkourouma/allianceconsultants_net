import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/shared/CTAButton";
import { AutomationSimulator } from "@/components/homepage/ai/AutomationSimulator";
import type { Homepage } from "@/lib/validators/content";

interface AISectionProps {
  aiSection: Homepage["aiSection"];
}

export function AISection({ aiSection }: AISectionProps) {
  return (
    <Section bg="dark" padding="md" aria-labelledby="ai-section-title" className="line-academie lg:py-24">
      {/* Heading over the full measure, capabilities as a two-column route list,
          then the simulator across the whole width. */}
      <h2 id="ai-section-title" className="t-h2 m-0 max-w-[24ch] text-white">
        {aiSection.title}
      </h2>
      <p className="t-body mt-5 max-w-[60ch] text-base leading-relaxed text-white/80 sm:text-lg">
        Nos experts conçoivent et déploient des automatisations sur mesure
        adaptées à vos processus métiers et à votre secteur d&apos;activité.{" "}
        <Link
          href="/services/automatisation-ia-processus-metiers"
          className="font-semibold text-white underline decoration-2 underline-offset-4 hover:decoration-4"
        >
          Automatisation IA pour PME : l&apos;audit de 5 jours
        </Link>
      </p>

      <div className="mt-8 flex flex-col gap-x-12 gap-y-7 lg:flex-row lg:items-center lg:justify-between">
        <ul
          className="m-0 grid list-none gap-x-10 gap-y-3 p-0 sm:grid-cols-2 lg:max-w-[52rem]"
          aria-label="Capacités IA d'Alliance Consultants"
        >
          {aiSection.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-white/85">
              <span
                aria-hidden
                className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-[#7d9bff] text-night"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>

        <div className="shrink-0">
          <CTAButton
            intent="automation"
            label={aiSection.ctaLabel}
            block="ai-section"
            size="lg"
            onDark
          />
        </div>
      </div>

      <div className="mt-10 lg:mt-12">
        <AutomationSimulator bullets={aiSection.bullets} />
      </div>
    </Section>
  );
}
