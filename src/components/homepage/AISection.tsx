import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/shared/CTAButton";
import { AutomationSimulator } from "@/components/homepage/ai/AutomationSimulator";
import type { Homepage } from "@/lib/validators/content";

interface AISectionProps {
  aiSection: Homepage["aiSection"];
}

/** The one dark moment of the carnet: AI + process-automation consulting. */
export function AISection({ aiSection }: AISectionProps) {
  return (
    <Section bg="dark" padding="md" aria-labelledby="ai-section-title" className="lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
        <div>
          <h2 id="ai-section-title" className="t-h2 m-0 max-w-[16ch] text-white">
            {aiSection.title}
          </h2>
          <p className="t-body mt-5 max-w-[54ch] text-base leading-relaxed text-white/85 sm:text-lg">
            Nos experts conçoivent et déploient des automatisations sur mesure
            adaptées à vos processus métiers et à votre secteur d&apos;activité.{" "}
            <Link
              href="/services/automatisation-ia-processus-metiers"
              className="font-semibold text-white underline decoration-2 underline-offset-4 hover:decoration-4"
            >
              Automatisation IA pour PME : l&apos;audit de 5 jours
            </Link>
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

        <ul
          className="m-0 list-none border-t-2 border-white/40 p-0"
          aria-label="Capacités IA d'Alliance Consultants"
        >
          {aiSection.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-4 border-b-2 border-dashed border-white/25 py-3.5 text-[1.0625rem] leading-snug text-white sm:text-[1.125rem]"
            >
              <span
                aria-hidden
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[3px] border-2 border-white/80"
              >
                <Check className="size-4" strokeWidth={2.25} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 lg:mt-16">
        <AutomationSimulator bullets={aiSection.bullets} />
      </div>
    </Section>
  );
}
