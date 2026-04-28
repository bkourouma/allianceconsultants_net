import Image from "next/image";
import { Section } from "@/components/ui/Section";
import type { SolutionProof, SolutionUseCase } from "@/lib/validators/content";

interface ProofBlockProps {
  proof?: SolutionProof;
  useCasesFallback?: SolutionUseCase[];
}

function isEmpty(proof?: SolutionProof): boolean {
  if (!proof) return true;
  return (
    (proof.logos?.length ?? 0) === 0 &&
    (proof.stats?.length ?? 0) === 0 &&
    (proof.testimonials?.length ?? 0) === 0
  );
}

export function ProofBlock({ proof, useCasesFallback }: ProofBlockProps) {
  const empty = isEmpty(proof);

  if (empty && (!useCasesFallback || useCasesFallback.length === 0)) {
    return null;
  }

  return (
    <Section bg="dark">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">
          {empty ? "Sur le terrain" : "Preuves & références"}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {empty ? "Quelques cas d'usage" : "Adopté par des organisations exigeantes"}
        </h2>
      </div>

      {empty && useCasesFallback && (
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {useCasesFallback.map((uc) => (
            <article
              key={uc.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:p-7"
            >
              <h3 className="text-lg font-bold tracking-tight text-white">
                {uc.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {uc.summary}
              </p>
            </article>
          ))}
        </div>
      )}

      {!empty && (
        <>
          {proof?.stats && proof.stats.length > 0 && (
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {proof.stats.map((s) => (
                <div
                  key={`${s.value}-${s.label}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-br from-white via-primary-light to-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {proof?.testimonials && proof.testimonials.length > 0 && (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {proof.testimonials.map((t) => (
                <blockquote
                  key={`${t.author}-${t.quote.slice(0, 24)}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:p-8"
                >
                  <p className="text-base italic leading-relaxed text-slate-100 sm:text-lg">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-5 border-t border-white/10 pt-4 text-sm font-medium text-slate-300">
                    {t.author}
                    {t.role ? ` — ${t.role}` : ""}
                    {t.organization ? `, ${t.organization}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}

          {proof?.logos && proof.logos.length > 0 && (
            <div className="mt-12">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Quelques organisations qui nous font confiance
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                {proof.logos.map((logo) => (
                  <Image
                    key={logo.name}
                    src={logo.src}
                    alt={logo.alt}
                    width={128}
                    height={64}
                    className="h-10 w-auto object-contain opacity-60 grayscale invert transition duration-300 hover:opacity-100"
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
