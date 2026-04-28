import { Section } from "@/components/ui/Section";
import type { SolutionBenefit } from "@/lib/validators/content";

interface BenefitListProps {
  benefits: SolutionBenefit[];
}

export function BenefitList({ benefits }: BenefitListProps) {
  return (
    <Section bg="gray">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Bénéfices métier
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Ce que la solution apporte
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Des résultats concrets, mesurables, pour vos équipes et vos
          opérations.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <article
            key={b.title}
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 lg:p-7"
          >
            {b.metric && (
              <p className="text-3xl font-bold tracking-tight text-primary lg:text-4xl">
                {b.metric}
              </p>
            )}
            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              {b.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              {b.description}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
