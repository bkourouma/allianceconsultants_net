import { Section } from "@/components/ui/Section";
import { SolutionCard } from "@/components/shared/SolutionCard";
import type { Homepage, Solution } from "@/lib/validators/content";

interface SolutionsSectionProps {
  sectionMeta: Homepage["solutionsSection"];
  solutions: Solution[];
}

export function SolutionsSection({ sectionMeta, solutions }: SolutionsSectionProps) {
  return (
    <Section bg="gray" aria-labelledby="solutions-title">
      <div className="text-center">
        <h2
          id="solutions-title"
          className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
        >
          {sectionMeta.title}
        </h2>
        {sectionMeta.intro && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{sectionMeta.intro}</p>
        )}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution) => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
      </div>
    </Section>
  );
}
