import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProjectReference } from "@/lib/projectReferences";

type TicketReference = Pick<
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

function truncate(input: string, max: number): string {
  const clean = input.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

function initials(name: string): string {
  return name
    .split(/[\s/]+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/**
 * A project reference drawn as a ticket stub: a navy header (year, sector),
 * the body (company, project, problem) and a detachable stub (client mark,
 * duration, « Lire la fiche »). The whole ticket is the link. Sectors stay
 * neutral navy: they are free text, not product lines.
 */
export function ReferenceTicket({ reference }: { reference: TicketReference }) {
  return (
    <article className="coupon group relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] focus-within:-translate-y-1 focus-within:shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)]">
      <div className="flex h-11 shrink-0 border-b-2 border-ink bg-ink text-white">
        <span className="t-num grid min-w-[4.25rem] place-items-center border-r-2 border-ink bg-panel px-3 font-display text-xl font-extrabold text-ink">
          {reference.year}
        </span>
        <span className="t-field flex min-w-0 flex-1 items-center truncate px-4 !text-white">
          {reference.sector ?? "Référence"}
        </span>
      </div>

      <div className="grid flex-1 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <div className="flex flex-col p-5 sm:p-6">
          <p className="t-field">{reference.companyName}</p>
          <h3 className="mt-2 font-display text-[1.5rem] font-bold leading-[1.08] text-ink">
            <Link
              href={`/references/${reference.id}`}
              className="after:absolute after:inset-0"
            >
              {reference.projectTitle}
            </Link>
          </h3>
          <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
            {truncate(reference.problem, 170)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-4 sm:flex-col sm:items-start sm:justify-between sm:border-l-2 sm:border-t-0 sm:py-5">
          {reference.logoUrl ? (
            <span className="grid h-11 max-w-[7rem] place-items-center rounded-[3px] border border-ink-mute/60 bg-white px-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reference.logoUrl}
                alt={`Logo ${reference.companyName}`}
                loading="lazy"
                className="max-h-8 max-w-full object-contain"
              />
            </span>
          ) : (
            <span
              aria-hidden
              className="grid size-11 place-items-center rounded-[3px] border-2 border-ink bg-white font-display text-lg font-extrabold text-ink"
            >
              {initials(reference.companyName)}
            </span>
          )}
          <div className="text-right sm:text-left">
            <p className="t-field">Durée</p>
            <p className="font-display text-base font-bold leading-tight text-ink">
              {reference.duration}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 font-display text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-ink">
              Lire la fiche
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                strokeWidth={2.25}
              />
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
