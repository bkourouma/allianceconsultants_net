import { CTAButton } from "@/components/shared/CTAButton";
import styles from "@/components/homepage/lower/Academie.module.css";
import stub from "@/components/homepage/lower/FinalStub.module.css";
import { cn } from "@/lib/utils";
import type { Homepage } from "@/lib/validators/content";

interface FinalCTAProps {
  finalCta: Homepage["finalCta"];
}

/**
 * Le talon de clôture : un grand coupon blanc sur fond nuit, titre, promesse
 * de réponse, la souche rouge (CTA). Le tampon « DÉMO DEMANDÉE » ne
 * s'imprime que lorsque la souche est survolée, focalisée ou pressée.
 */
export function FinalCTA({ finalCta }: FinalCTAProps) {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-night py-16 text-ink lg:py-24"
      style={{ "--notch-bg": "var(--color-night)" } as React.CSSProperties}
    >
      <div className="wrap">
        <div className={cn(stub.root, "coupon lg:grid lg:grid-cols-[minmax(0,1fr)_19rem]")}>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 rounded-tl-[2px] bg-ink px-5 py-2.5 text-white sm:px-8 lg:rounded-tr-none">
              <span className="!text-xs t-field !text-white">Demande de démo</span>
              <span className="!text-xs t-field !text-white">Alliance Consultants</span>
            </div>

            <div className="p-6 sm:p-10 lg:p-14">
              <h2 id="final-cta-title" className="t-h2 max-w-[18ch]">
                {finalCta.title}
              </h2>
              <p className="t-lead mt-5">
                Nos experts vous répondent sous 24 à 48 heures ouvrées. Démo personnalisée, sans
                engagement.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <span className={cn(stub.primary, "contents")}>
                  <CTAButton
                    intent="demo"
                    label={finalCta.label}
                    block="final-cta"
                    size="lg"
                    className="h-auto min-h-14 w-full justify-center py-2.5 text-center sm:w-auto"
                  />
                </span>
                <CTAButton
                  intent="contact"
                  label="Nous écrire"
                  block="final-cta"
                  size="lg"
                  variant="secondary"
                  className="h-auto min-h-14 w-full justify-center py-2.5 text-center sm:w-auto"
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              styles.stub,
              "flex flex-col justify-between gap-8 rounded-br-[2px] px-6 py-6 sm:px-10 lg:px-6"
            )}
          >
            <p className="!text-xs t-field">Coupon détachable</p>
            <div className={stub.slot}>
              <span aria-hidden className={cn("stamp", stub.stamp)}>
                Démo demandée
              </span>
            </div>
            <span aria-hidden className={cn(styles.bars, "w-full")} />
          </div>
        </div>
      </div>
    </section>
  );
}
