import { Section } from "@/components/ui/Section";
import type { SolutionBenefit } from "@/lib/validators/content";

interface BenefitListProps {
  benefits: SolutionBenefit[];
}

export function BenefitList({ benefits }: BenefitListProps) {
  return (
    <Section bg="white">
      <div className="mb-10 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Bénéfices métier
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Ce que la solution apporte concrètement à votre organisation.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <article
            key={b.title}
            className="rounded-xl border border-gray-200 bg-gray-50 p-6"
          >
            {b.metric && (
              <p className="mb-3 text-2xl font-bold text-[var(--color-primary)]">
                {b.metric}
              </p>
            )}
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{b.title}</h3>
            <p className="text-sm leading-relaxed text-gray-700">{b.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
