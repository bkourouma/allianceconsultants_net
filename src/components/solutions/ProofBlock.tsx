import Image from "next/image";
import type { SolutionProof, SolutionUseCase } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";
import { UseCaseCoupon } from "./UseCases";

interface ProofBlockProps {
  proof?: SolutionProof;
  useCasesFallback?: SolutionUseCase[];
}

export function hasProof(proof?: SolutionProof): boolean {
  if (!proof) return false;
  return (
    (proof.logos?.length ?? 0) > 0 ||
    (proof.stats?.length ?? 0) > 0 ||
    (proof.testimonials?.length ?? 0) > 0
  );
}

/**
 * Real content only. Shows validated proof (logos, stats, testimonials) when
 * the content has any; otherwise falls back to the real use cases from the MDX.
 * Nothing here is invented.
 */
export function ProofBlock({ proof, useCasesFallback }: ProofBlockProps) {
  const filled = hasProof(proof);

  if (!filled && (!useCasesFallback || useCasesFallback.length === 0)) {
    return null;
  }

  return (
    <section
      id="preuves"
      aria-labelledby="proof-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap">
        <SectionHead
          id="proof-title"
          title={filled ? "Preuves et références" : "Sur le terrain"}
        />

        {!filled && useCasesFallback && (
          <div className="mt-10">
            <UseCaseCoupon useCases={useCasesFallback} />
          </div>
        )}

        {filled && (
          <div className="mt-10 grid gap-8">
            {proof?.stats && proof.stats.length > 0 && (
              <dl className="coupon grid sm:grid-cols-2 lg:grid-cols-4">
                {proof.stats.map((st) => (
                  <div
                    key={`${st.value}-${st.label}`}
                    className="border-t-2 border-dashed border-ink px-6 py-5 first:border-t-0 sm:border-l-2 sm:border-t-0 sm:first:border-l-0"
                  >
                    <dt className="t-field">{st.label}</dt>
                    <dd className="t-num carbon mt-1 font-display text-4xl font-extrabold">
                      {st.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {proof?.testimonials && proof.testimonials.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2">
                {proof.testimonials.map((t) => (
                  <blockquote
                    key={`${t.author}-${t.quote.slice(0, 24)}`}
                    className="coupon p-6 sm:p-8"
                  >
                    <p className="font-display text-2xl font-semibold leading-snug text-ink">
                      «&nbsp;{t.quote}&nbsp;»
                    </p>
                    <footer className="t-field mt-5">
                      {t.author}
                      {t.role ? `, ${t.role}` : ""}
                      {t.organization ? ` · ${t.organization}` : ""}
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}

            {proof?.logos && proof.logos.length > 0 && (
              <ul className="coupon flex flex-wrap items-center gap-x-10 gap-y-6 px-6 py-6 sm:px-8">
                {proof.logos.map((logo) => (
                  <li key={logo.name}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={128}
                      height={64}
                      className="h-10 w-auto object-contain"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
