import { Section } from "@/components/ui/Section";
import type { SolutionUseCase } from "@/lib/validators/content";

interface UseCasesProps {
  useCases: SolutionUseCase[];
}

export function UseCases({ useCases }: UseCasesProps) {
  if (!useCases.length) return null;
  return (
    <Section bg="gray">
      <div className="mb-10 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Cas d&apos;usage
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Quelques exemples concrets d&apos;utilisation de la solution sur le terrain.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {useCases.map((uc) => (
          <article
            key={uc.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{uc.title}</h3>
            <p className="text-sm leading-relaxed text-gray-700">{uc.summary}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
