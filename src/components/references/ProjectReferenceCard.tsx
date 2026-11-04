import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProjectReference } from "@/lib/projectReferences";
import { cn } from "@/lib/utils";
import styles from "./ProjectReferenceCard.module.css";

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
 * Référence projet en souche de ticket (utilisée en liste et homepage).
 * Cliquable vers /references/[id]. Filet encre neutre : la couleur de ligne est
 * réservée aux solutions, et une référence n'en porte pas. Le secteur est un
 * champ en capitales ; le logo n'apparaît que s'il existe.
 */
export function ProjectReferenceCard({ reference }: ProjectReferenceCardProps) {
  const teaser = truncate(reference.problem, 180);

  return (
    <article
      className={cn(
        styles.ticket,
        "coupon group relative flex h-full flex-col",
      )}
    >
      <div className="flex min-h-14 items-center justify-between gap-4 border-b-2 border-ink px-5 py-2.5">
        <span className="t-field">{reference.sector || "Référence"}</span>
        {reference.logoUrl ? (
          <span className="grid h-10 place-items-center">
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

      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <p className="text-sm font-semibold text-ink-mute">
          {reference.companyName}
        </p>
        <h3 className="t-h3 mt-1 text-ink">
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

        <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
          {teaser}
        </p>
      </div>

      <p
        className={cn(
          styles.tear,
          "flex items-center justify-between gap-2 rounded-b-[2px] px-5 py-3.5 font-display text-base font-bold uppercase tracking-[0.06em] text-ink",
        )}
      >
        Lire la fiche
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </p>
    </article>
  );
}

function truncate(input: string, max: number): string {
  const clean = input.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}
