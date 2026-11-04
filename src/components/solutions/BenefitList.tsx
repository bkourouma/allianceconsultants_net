import { Check } from "lucide-react";
import type { SolutionBenefit } from "@/lib/validators/content";

interface BenefitListProps {
  benefits: SolutionBenefit[];
}

/**
 * Benefits as ruled rows: hairline-separated, a product-colour tick chip, no
 * cards. `metric` strings in the content are unvalidated claims and are
 * intentionally not rendered as statistics.
 */
export function BenefitList({ benefits }: BenefitListProps) {
  return (
    <section
      id="benefices"
      aria-labelledby="benefices-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <h2
          id="benefices-title"
          className="t-h2 text-ink lg:sticky lg:top-[calc(var(--site-header-h,4rem)+4.5rem)] lg:self-start"
        >
          Ce que vous en retirez, concrètement
        </h2>
        <ul className="border-t-2 border-ink">
          {benefits.map((b) => (
            <li
              key={b.title}
              className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-rule py-5 sm:gap-x-5 sm:py-6"
            >
              <span
                aria-hidden
                className="mt-0.5 grid size-8 place-items-center rounded-[3px] bg-[var(--accent)] text-[var(--on-accent)] ring-1 ring-ink"
              >
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                  {b.title}
                </h3>
                <p className="t-body mt-1.5 text-ink-soft">{b.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
