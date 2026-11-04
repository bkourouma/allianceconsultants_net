import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectReferenceCard } from "@/components/references/ProjectReferenceCard";
import { HistoryTimeline } from "@/components/homepage/lower/HistoryTimeline";
import type { Homepage, Reference } from "@/lib/validators/content";
import type { PublicProjectReference } from "@/lib/projectReferences";

interface ReferencesSectionProps {
  referencesSection: Homepage["referencesSection"];
  references: Reference[];
  projectReferences?: PublicProjectReference[];
}

const FOUNDED = 2003;

/**
 * Crédibilité : l'histoire d'Alliance en passeport (une page de visa par
 * jalon), puis les vraies références en souches de ticket. Rien n'est affiché
 * pour les blocs sans données réelles.
 */
export function ReferencesSection({
  referencesSection,
  references,
  projectReferences = [],
}: ReferencesSectionProps) {
  const validatedLogos = references.filter(
    (r) => r.validated && r.showOnHomepage && r.type === "LOGO" && r.logoUrl,
  );
  const testimonials = references.filter(
    (r) =>
      r.validated &&
      r.showOnHomepage &&
      r.type === "TESTIMONIAL" &&
      r.testimonialQuote,
  );
  const years = new Date().getFullYear() - FOUNDED;

  return (
    <section
      aria-labelledby="references-title"
      className="bg-enamel py-16 text-ink lg:py-24"
    >
      <div className="wrap">
        <hr aria-hidden className="tear mb-14 lg:mb-20" />

        <div className="max-w-3xl">
          <h2 id="references-title" className="t-h2">
            {referencesSection.title}
          </h2>
          <p className="t-lead mt-4 max-w-[52ch]">
            {years} ans d&apos;histoire, des premiers projets de dématérialisation
            à l&apos;offre SaaS d&apos;aujourd&apos;hui.
          </p>
        </div>

        <HistoryTimeline
          className="mt-10 lg:mt-14"
          history={referencesSection.history}
        />

        {validatedLogos.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h3 className="t-h3">Ils nous font confiance</h3>
            <ul className="coupon mt-6 grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-5">
              {validatedLogos.map((ref) => (
                <li
                  key={ref.id}
                  className="grid min-h-24 place-items-center p-5 shadow-[inset_-1px_-1px_0_var(--color-rule)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ref.logoUrl}
                    alt={ref.clientName}
                    loading="lazy"
                    className="h-10 w-auto max-w-full object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-3">
            {testimonials.map((ref) => (
              <figure key={ref.id} className="coupon flex flex-col p-6 lg:p-7">
                <blockquote className="flex-1 font-display text-xl font-semibold leading-snug text-ink text-pretty">
                  &ldquo;{ref.testimonialQuote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t-2 border-dashed border-ink pt-4">
                  <span className="block text-sm font-bold text-ink">
                    {ref.testimonialAuthor ?? ref.clientName}
                  </span>
                  {ref.testimonialRole && (
                    <span className="!text-xs t-field mt-1 block">{ref.testimonialRole}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {projectReferences.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="t-h3">Réalisations clés</h3>
              <Link
                href="/references"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink"
              >
                <span className="underline decoration-ink/30 underline-offset-4 transition-colors group-hover:decoration-ink">
                  Toutes les références
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {projectReferences.map((ref) => (
                <ProjectReferenceCard key={ref.id} reference={ref} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
