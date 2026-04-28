import Link from "next/link";
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
 * Cliquable vers /references/[id].
 */
export function ProjectReferenceCard({ reference }: ProjectReferenceCardProps) {
  const teaser = truncate(reference.problem, 180);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl">
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-dark">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35), transparent 60%)",
          }}
        />
        <div className="relative flex h-full items-center justify-between gap-4 px-6">
          {reference.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reference.logoUrl}
              alt={`Logo ${reference.companyName}`}
              loading="lazy"
              className="h-10 max-w-[8rem] object-contain opacity-95"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-xl bg-white/15 text-lg font-bold text-white shadow-inner backdrop-blur-sm"
            >
              {initials(reference.companyName)}
            </span>
          )}
          {reference.sector ? (
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/85">
              {reference.sector}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {reference.companyName}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-xl">
          <Link
            href={`/references/${reference.id}`}
            className="after:absolute after:inset-0 hover:text-primary"
          >
            {reference.projectTitle}
          </Link>
        </h3>

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <div>
            <dt className="sr-only">Année</dt>
            <dd className="font-medium text-slate-700">{reference.year}</dd>
          </div>
          <div>
            <dt className="sr-only">Durée</dt>
            <dd>· {reference.duration}</dd>
          </div>
        </dl>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
          {teaser}
        </p>

        <p className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
          Lire la fiche
          <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-0.5">
            →
          </span>
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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
