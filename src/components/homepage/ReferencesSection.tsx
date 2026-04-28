import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { ProjectReferenceCard } from "@/components/references/ProjectReferenceCard";
import type { Homepage, Reference } from "@/lib/validators/content";
import type { PublicProjectReference } from "@/lib/projectReferences";

interface ReferencesSectionProps {
  referencesSection: Homepage["referencesSection"];
  references: Reference[];
  projectReferences?: PublicProjectReference[];
}

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

  return (
    <Section bg="white" aria-labelledby="references-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Références &amp; histoire
        </p>
        <h2
          id="references-title"
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          {referencesSection.title}
        </h2>
      </div>

      <div className="mx-auto mt-14 max-w-2xl">
        <ol
          className="relative space-y-8 border-l border-slate-200 pl-8"
          aria-label="Histoire d'Alliance Consultants"
        >
          {referencesSection.history.map((milestone) => (
            <li key={milestone.year} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[37px] top-1 grid size-5 place-items-center rounded-full bg-white ring-4 ring-white"
              >
                <span className="size-3 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-md" />
              </span>
              <span className="sr-only">{milestone.year}</span>
              <time
                dateTime={String(milestone.year)}
                className="block text-sm font-semibold uppercase tracking-[0.16em] text-primary"
              >
                {milestone.year}
              </time>
              <p className="mt-1 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">
                {milestone.label}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {validatedLogos.length > 0 && (
        <div className="mt-20">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ils nous font confiance
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12">
            {/* eslint-disable @next/next/no-img-element */}
            {validatedLogos.map((ref) => (
              <img
                key={ref.id}
                src={ref.logoUrl}
                alt={ref.clientName}
                loading="lazy"
                className="h-10 w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            ))}
            {/* eslint-enable @next/next/no-img-element */}
          </div>
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((ref) => (
            <figure
              key={ref.id}
              className="flex flex-col rounded-2xl border border-slate-200/70 bg-slate-50 p-6 lg:p-7"
            >
              <blockquote className="flex-1 text-base leading-relaxed text-slate-700">
                &ldquo;{ref.testimonialQuote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-900">
                  {ref.testimonialAuthor}
                </p>
                {ref.testimonialRole && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {ref.testimonialRole}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {projectReferences.length > 0 && (
        <div className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Réalisations clés
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Des projets concrets, des résultats mesurables
              </h3>
            </div>
            <Link
              href="/references"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Toutes les références →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projectReferences.map((ref) => (
              <ProjectReferenceCard key={ref.id} reference={ref} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
