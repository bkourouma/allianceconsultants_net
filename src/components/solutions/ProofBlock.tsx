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
    // The validator already guarantees this never happens — defensive fallback
    return null;
  }

  return (
    <Section bg="white">
      <h2 className="mb-10 text-2xl font-bold text-gray-900 sm:text-3xl">
        {empty ? "Quelques cas d'usage" : "Preuves et références"}
      </h2>

      {empty && useCasesFallback && (
        <div className="grid gap-6 md:grid-cols-2">
          {useCasesFallback.map((uc) => (
            <article
              key={uc.title}
              className="rounded-xl border border-gray-200 bg-gray-50 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{uc.title}</h3>
              <p className="text-sm leading-relaxed text-gray-700">{uc.summary}</p>
            </article>
          ))}
        </div>
      )}

      {!empty && (
        <div className="space-y-12">
          {proof?.stats && proof.stats.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {proof.stats.map((s) => (
                <div
                  key={`${s.value}-${s.label}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center"
                >
                  <p className="text-3xl font-bold text-[var(--color-primary)]">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {proof?.logos && proof.logos.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                Quelques organisations qui nous font confiance
              </h3>
              <div className="flex flex-wrap items-center gap-6">
                {proof.logos.map((logo) => (
                  <div
                    key={logo.name}
                    className="flex h-16 w-32 items-center justify-center"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={128}
                      height={64}
                      className="max-h-14 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {proof?.testimonials && proof.testimonials.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {proof.testimonials.map((t) => (
                <blockquote
                  key={`${t.author}-${t.quote.slice(0, 24)}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6"
                >
                  <p className="mb-4 text-base italic text-gray-800">“{t.quote}”</p>
                  <footer className="text-sm font-medium text-gray-700">
                    {t.author}
                    {t.role ? ` — ${t.role}` : ""}
                    {t.organization ? `, ${t.organization}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
