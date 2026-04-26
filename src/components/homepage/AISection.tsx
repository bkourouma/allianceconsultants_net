import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Homepage } from "@/lib/validators/content";

interface AISectionProps {
  aiSection: Homepage["aiSection"];
}

export function AISection({ aiSection }: AISectionProps) {
  return (
    <Section bg="dark" aria-labelledby="ai-section-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            IA & Automatisation
          </p>
          <h2
            id="ai-section-title"
            className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {aiSection.title}
          </h2>
          <p className="mt-4 text-gray-400">
            Nos experts conçoivent et déploient des automatisations sur mesure adaptées à vos
            processus métiers et à votre secteur d&apos;activité.
          </p>
          <div className="mt-8">
            <CTAButton
              intent="automation"
              label={aiSection.ctaLabel}
              block="ai-section"
              size="md"
            />
          </div>
        </div>

        <ul className="space-y-4" aria-label="Capacités IA d'Alliance Consultants">
          {aiSection.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400"
                aria-hidden="true"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                </svg>
              </span>
              <span className="text-gray-300">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
