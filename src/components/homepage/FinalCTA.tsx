import { Section } from "@/components/ui/Section";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Homepage } from "@/lib/validators/content";

interface FinalCTAProps {
  finalCta: Homepage["finalCta"];
}

export function FinalCTA({ finalCta }: FinalCTAProps) {
  return (
    <Section bg="primary" aria-labelledby="final-cta-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="final-cta-title"
          className="text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          {finalCta.title}
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Nos experts vous répondent sous 24h. Démo personnalisée, sans engagement.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <CTAButton
            intent="demo"
            label={finalCta.label}
            block="final-cta"
            size="lg"
            onDark
          />
          <CTAButton
            intent="contact"
            label="Nous écrire"
            block="final-cta"
            size="lg"
            variant="secondary"
            onDark
          />
        </div>
      </div>
    </Section>
  );
}
