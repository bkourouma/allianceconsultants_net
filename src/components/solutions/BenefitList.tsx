import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { SolutionBenefit } from "@/lib/validators/content";

interface BenefitListProps {
  benefits: SolutionBenefit[];
}

/**
 * Benefits as boarding-pass rows: hairline-separated, a line-coloured tick
 * roundel, no cards. `metric` strings in the content are unvalidated claims
 * and are intentionally not rendered as statistics.
 */
export function BenefitList({ benefits }: BenefitListProps) {
  return (
    <Section bg="gray" padding="sm" aria-labelledby="benefices-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <h2 id="benefices-title" className="t-h3 max-w-[18ch] text-ink lg:sticky lg:top-40 lg:self-start">
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
                className="mt-0.5 grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]"
              >
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.01em] text-ink sm:text-xl">
                  {b.title}
                </h3>
                <p className="t-body mt-1.5 text-ink-soft">{b.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
