import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
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
    <Section
      bg="gray"
      aria-labelledby="references-title"
      className="border-t border-rule"
    >
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
          <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-rule ring-1 ring-rule sm:grid-cols-3 lg:grid-cols-5">
            {validatedLogos.map((ref) => (
              <li
                key={ref.id}
                className="grid min-h-24 place-items-center bg-panel p-5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ref.logoUrl}
                  alt={ref.clientName}
                  loading="lazy"
                  className="h-10 w-auto max-w-full object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-3">
          {testimonials.map((ref) => (
            <figure
              key={ref.id}
              className="flex flex-col rounded-lg bg-panel p-6 ring-1 ring-rule lg:p-7"
            >
              <blockquote className="flex-1 font-display text-xl font-semibold leading-snug tracking-tight text-ink text-pretty">
                &ldquo;{ref.testimonialQuote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-rule pt-4">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-extrabold text-white"
                >
                  {(ref.testimonialAuthor ?? ref.clientName)
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">
                    {ref.testimonialAuthor}
                  </span>
                  {ref.testimonialRole && (
                    <span className="block text-sm text-ink-mute">
                      {ref.testimonialRole}
                    </span>
                  )}
                </span>
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

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projectReferences.map((ref) => (
              <ProjectReferenceCard key={ref.id} reference={ref} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
