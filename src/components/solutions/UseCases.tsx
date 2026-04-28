import { Section } from "@/components/ui/Section";
import type { SolutionUseCase } from "@/lib/validators/content";

interface UseCasesProps {
  useCases: SolutionUseCase[];
}

export function UseCases({ useCases }: UseCasesProps) {
  if (!useCases.length) return null;
  return (
    <Section bg="white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Sur le terrain
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Cas d&apos;usage
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Quelques exemples concrets d&apos;utilisation de la solution.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {useCases.map((uc, i) => (
          <article
            key={uc.title}
            className="relative flex flex-col rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-6 lg:p-8"
          >
            <span
              aria-hidden="true"
              className="text-5xl font-bold leading-none text-primary/15 lg:text-6xl"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              {uc.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {uc.summary}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
