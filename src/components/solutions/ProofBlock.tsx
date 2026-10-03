import Image from "next/image";
import { Section } from "@/components/ui/Section";
import type { SolutionProof, SolutionUseCase } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";
import s from "./Solutions.module.css";

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
 * Night panel. Shows validated proof (logos, stats, testimonials) when the
 * content has any; otherwise falls back to real use cases from the MDX.
 * Nothing here is invented.
 */
export function ProofBlock({ proof, useCasesFallback }: ProofBlockProps) {
  const filled = hasProof(proof);

  if (!filled && (!useCasesFallback || useCasesFallback.length === 0)) {
    return null;
  }

  return (
    <Section
      id="preuves"
      bg="dark"
      padding="md"
      aria-labelledby="proof-title"
      className={s.focusNight}
    >
      <SectionHead
        id="proof-title"
        onDark
        title={filled ? "Preuves et références" : "Sur le terrain"}
      />

      {!filled && useCasesFallback && (
        <ol className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {useCasesFallback.map((uc) => (
            <li key={uc.title} className="relative border-t-2 border-white/40 pt-8">
              <span
                aria-hidden
                className="absolute -top-[13px] left-0 size-6 rounded-full border-[5px] border-[var(--accent)] bg-night"
              />
              <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.01em] text-white">
                {uc.title}
              </h3>
              <p className="t-body mt-3 text-white/75">{uc.summary}</p>
            </li>
          ))}
        </ol>
      )}

      {filled && (
        <>
          {proof?.stats && proof.stats.length > 0 && (
            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {proof.stats.map((st) => (
                <div
                  key={`${st.value}-${st.label}`}
                  className="border-t-2 border-white/40 pt-4"
                >
                  <dt className="text-sm text-white/75">{st.label}</dt>
                  <dd className="t-num mt-1 font-display text-3xl font-extrabold tracking-[-0.02em] text-white">
                    {st.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {proof?.testimonials && proof.testimonials.length > 0 && (
            <div className="mt-12 grid gap-10 md:grid-cols-2">
              {proof.testimonials.map((t) => (
                <blockquote
                  key={`${t.author}-${t.quote.slice(0, 24)}`}
                  className="border-t-2 border-white/40 pt-5"
                >
                  <p className="font-display text-xl font-semibold leading-snug text-white">
                    «&nbsp;{t.quote}&nbsp;»
                  </p>
                  <footer className="mt-4 text-sm font-medium text-white/75">
                    {t.author}
                    {t.role ? `, ${t.role}` : ""}
                    {t.organization ? ` · ${t.organization}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}

          {proof?.logos && proof.logos.length > 0 && (
            <div className="mt-12 border-t-2 border-white/40 pt-6">
              <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
                {proof.logos.map((logo) => (
                  <li key={logo.name}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={128}
                      height={64}
                      className="h-10 w-auto object-contain opacity-80 brightness-0 invert"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
