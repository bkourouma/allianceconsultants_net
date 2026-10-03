import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProjectReference } from "@/lib/projectReferences";

interface ProjectReferenceCardProps {
  reference: Pick<
    PublicProjectReference,
    | "id"
    | "companyName"
    | "projectTitle"
    | "year"
    | "duration"
    | "sector"
    | "logoUrl"
    | "problem"
  >;
}

/**
 * Carte synthétique d'une référence projet (utilisée en liste et homepage).
 * Cliquable vers /references/[id]. Bandeau neutre (encre) : la couleur de ligne
 * est réservée aux solutions, et une référence n'en porte pas.
 */
export function ProjectReferenceCard({ reference }: ProjectReferenceCardProps) {
  const teaser = truncate(reference.problem, 180);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-panel ring-1 ring-rule transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(11,27,58,0.35)]">
      <div className="flex min-h-16 items-center justify-between gap-4 bg-ink px-6 py-3 text-white">
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-3.5 shrink-0 rounded-full border-[3px] border-white bg-ink"
          />
          <span className="t-station leading-tight">
            {reference.sector || "Référence"}
          </span>
        </span>
        {reference.logoUrl ? (
          <span className="grid h-11 place-items-center rounded bg-white px-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reference.logoUrl}
              alt={`Logo ${reference.companyName}`}
              loading="lazy"
              className="max-h-8 max-w-[7.5rem] object-contain"
            />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <p className="text-sm font-semibold text-ink-mute">
          {reference.companyName}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold leading-snug tracking-tight text-balance text-ink">
          <Link
            href={`/references/${reference.id}`}
            className="after:absolute after:inset-0"
          >
            {reference.projectTitle}
          </Link>
        </h3>

        <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-mute">
          <div>
            <dt className="sr-only">Année</dt>
            <dd className="t-num font-semibold text-ink">{reference.year}</dd>
          </div>
          <div>
            <dt className="sr-only">Durée</dt>
            <dd>· {reference.duration}</dd>
          </div>
        </dl>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
          {teaser}
        </p>

        <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-ink">
          Lire la fiche
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </p>
      </div>
    </article>
  );
}

function truncate(input: string, max: number): string {
  const clean = input.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}