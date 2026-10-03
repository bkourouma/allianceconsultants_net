import { Section } from "@/components/ui/Section";
import type { SolutionUseCase } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";

interface UseCasesProps {
  useCases: SolutionUseCase[];
}

export function UseCases({ useCases }: UseCasesProps) {
  if (!useCases.length) return null;
  return (
    <Section id="cas-usage" bg="gray" padding="md" aria-labelledby="usecases-title">
      <SectionHead id="usecases-title" title="Cas d’usage" />
      <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => (
          <li key={uc.title} className="border-t-2 border-ink pt-5">
            <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.01em] text-ink">
              {uc.title}
            </h3>
            <p className="t-body mt-3 text-ink-soft">{uc.summary}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
