import { Section } from "@/components/ui/Section";
import { SolutionCard } from "@/components/shared/SolutionCard";
import type { Homepage, Solution } from "@/lib/validators/content";

interface SolutionsSectionProps {
  sectionMeta: Homepage["solutionsSection"];
  solutions: Solution[];
}

export function SolutionsSection({
  sectionMeta,
  solutions,
}: SolutionsSectionProps) {
  return (
    <Section bg="gray" aria-labelledby="solutions-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Plateformes SaaS
        </p>
        <h2
          id="solutions-title"
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          {sectionMeta.title}
        </h2>
        {sectionMeta.intro && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {sectionMeta.intro}
          </p>
        )}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {solutions.map((solution) => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
      </div>
    </Section>
  );
}
