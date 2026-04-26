import { Section } from "@/components/ui/Section";
import type { Homepage, Reference } from "@/lib/validators/content";

interface ReferencesSectionProps {
  referencesSection: Homepage["referencesSection"];
  references: Reference[];
}

export function ReferencesSection({ referencesSection, references }: ReferencesSectionProps) {
  const validatedLogos = references.filter(
    (r) => r.validated && r.showOnHomepage && r.type === "LOGO" && r.logoUrl
  );
  const testimonials = references.filter(
    (r) => r.validated && r.showOnHomepage && r.type === "TESTIMONIAL" && r.testimonialQuote
  );

  return (
    <Section bg="white" aria-labelledby="references-title">
      <div className="text-center">
        <h2
          id="references-title"
          className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
        >
          {referencesSection.title}
        </h2>
      </div>

      {/* Timeline */}
      <div className="mt-12">
        <ol className="relative border-l border-gray-200" aria-label="Histoire d'Alliance Consultants">
          {referencesSection.history.map((milestone) => (
            <li key={milestone.year} className="mb-8 ml-6 last:mb-0">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] ring-8 ring-white">
                <span className="sr-only">{milestone.year}</span>
                <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
              </span>
              <time
                dateTime={String(milestone.year)}
                className="mb-1 text-sm font-semibold leading-none text-[var(--color-primary)]"
              >
                {milestone.year}
              </time>
              <p className="text-base font-medium text-gray-900">{milestone.label}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Logos clients validés uniquement */}
      {validatedLogos.length > 0 && (
        <div className="mt-12">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-gray-500">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* eslint-disable @next/next/no-img-element */}
            {validatedLogos.map((ref) => (
              <img
                key={ref.id}
                src={ref.logoUrl}
                alt={ref.clientName}
                className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                loading="lazy"
              />
            ))}
            {/* eslint-enable @next/next/no-img-element */}
          </div>
        </div>
      )}

      {/* Témoignages validés uniquement */}
      {testimonials.length > 0 && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((ref) => (
            <figure
              key={ref.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-6"
            >
              <blockquote className="text-sm leading-relaxed text-gray-700">
                &ldquo;{ref.testimonialQuote}&rdquo;
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-semibold text-gray-900">{ref.testimonialAuthor}</p>
                {ref.testimonialRole && (
                  <p className="text-xs text-gray-500">{ref.testimonialRole}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}
