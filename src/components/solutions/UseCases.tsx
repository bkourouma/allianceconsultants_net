import type { SolutionUseCase } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";

interface UseCasesProps {
  useCases: SolutionUseCase[];
}

/** Use cases as one coupon, one perforated column per case (rows on phones). */
export function UseCaseCoupon({ useCases }: UseCasesProps) {
  return (
    <ol className="coupon grid md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]" style={{ "--cols": useCases.length } as React.CSSProperties}>
      {useCases.map((uc, i) => (
        <li
          key={uc.title}
          className="relative px-6 py-6 sm:px-8 sm:py-8"
        >
          {i > 0 && (
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 border-t-2 border-dashed border-ink md:inset-x-auto md:inset-y-0 md:left-0 md:border-l-2 md:border-t-0"
            />
          )}
          <p className="t-field">Cas d&apos;usage {i + 1}</p>
          <h3 className="mt-3 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
            {uc.title}
          </h3>
          <p className="t-body mt-3 text-ink-soft">{uc.summary}</p>
        </li>
      ))}
    </ol>
  );
}

export function UseCases({ useCases }: UseCasesProps) {
  if (!useCases.length) return null;
  return (
    <section
      id="cas-usage"
      aria-labelledby="usecases-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap">
        <SectionHead id="usecases-title" title="Cas d’usage" />
        <div className="mt-10">
          <UseCaseCoupon useCases={useCases} />
        </div>
      </div>
    </section>
  );
}
