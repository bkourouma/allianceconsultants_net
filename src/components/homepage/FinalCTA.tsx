import { CTAButton } from "@/components/shared/CTAButton";
import { TerminusStage } from "@/components/homepage/lower/TerminusStage";
import styles from "@/components/homepage/lower/Terminus.module.css";
import type { Homepage } from "@/lib/validators/content";

interface FinalCTAProps {
  finalCta: Homepage["finalCta"];
}

/**
 * The terminus: all six lines converge into one roundel.
 * Contrast section on the night-navy ground.
 */
export function FinalCTA({ finalCta }: FinalCTAProps) {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative overflow-hidden bg-night text-white"
    >
      <TerminusStage>
        <div className="relative z-10 w-full px-[max(1rem,4vw)] pb-14 sm:w-auto sm:p-0">
          <div
            className={`${styles.roundel} relative z-10 flex w-full flex-col items-center justify-center rounded-[2.5rem] bg-ink px-6 py-10 text-center ring-[10px] ring-white sm:aspect-square sm:size-[500px] sm:rounded-full sm:p-0 lg:size-[560px]`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-[inherit] ring-1 ring-white/20"
            />
            <div className="relative sm:max-w-[22rem] lg:max-w-[25rem]">
              <h2
                id="final-cta-title"
                className="font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.6rem)] font-extrabold leading-[1.05] tracking-tight text-balance"
              >
                {finalCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-[34ch] text-base leading-relaxed text-white/80">
                Nos experts vous répondent sous 24 à 48 heures ouvrées. Démo personnalisée, sans
                engagement.
              </p>
              <div className="mt-7 flex flex-col items-center gap-3">
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
                  size="md"
                  variant="secondary"
                  onDark
                />
              </div>
            </div>
          </div>
        </div>
      </TerminusStage>
    </section>
  );
}
