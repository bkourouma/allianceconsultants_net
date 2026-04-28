import { CTAButton } from "@/components/shared/CTAButton";
import type { Homepage } from "@/lib/validators/content";

interface FinalCTAProps {
  finalCta: Homepage["finalCta"];
}

export function FinalCTA({ finalCta }: FinalCTAProps) {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 0%, rgba(255,255,255,0.25), transparent 70%), radial-gradient(50% 60% at 10% 100%, rgba(255,255,255,0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="final-cta-title"
            className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Nos experts vous répondent sous 24 h. Démo personnalisée, sans
            engagement.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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
      </div>
    </section>
  );
}
