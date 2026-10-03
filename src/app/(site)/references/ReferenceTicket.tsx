import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LINES, type NetworkLine } from "@/lib/network";
import type { PublicProjectReference } from "@/lib/projectReferences";

/**
 * Sectors are free text coming from the DB; colour them deterministically
 * with one of the six line colours so a sector always keeps its colour.
 */
export function lineForSector(sector: string | null | undefined): NetworkLine {
  const key = (sector ?? "").trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return LINES[h % LINES.length];
}

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
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/**
 * A project reference drawn as a ticket: a coloured stub (the line of its
 * sector) and a body, separated by a perforation. The whole ticket is the link.
 */
export function ReferenceTicket({ reference }: { reference: TicketReference }) {
  const line = lineForSector(reference.sector);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-panel ring-1 ring-rule transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_rgba(11,27,58,0.28)] sm:flex-row">
      {/* stub */}
      <div
        className="relative flex shrink-0 items-center justify-between gap-4 px-5 py-4 sm:w-36 sm:flex-col sm:items-start sm:justify-between sm:py-5"
        style={{ background: line.color, color: line.onColor }}
      >
        {reference.logoUrl ? (
          <span className="grid h-11 max-w-[6.5rem] place-items-center rounded-[4px] bg-white px-2">
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
            className="grid size-11 place-items-center rounded-full bg-white font-display text-base font-extrabold text-ink"
          >
            {initials(reference.companyName)}
          </span>
        )}
        <div className="text-right sm:text-left">
          <p className="t-num font-display text-2xl font-extrabold leading-none">
            {reference.year}
          </p>
          {reference.sector ? (
            <p className="mt-1.5 text-xs font-bold leading-tight">
              {reference.sector}
            </p>
          ) : null}
        </div>
      </div>

      {/* perforation */}
      <div
        aria-hidden
        className="relative border-t-2 border-dashed border-rule sm:border-l-2 sm:border-t-0"
      >
        <span className="absolute left-0 top-0 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-enamel sm:left-px sm:top-0" />
        <span className="absolute right-0 top-0 size-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-enamel sm:left-px sm:right-auto sm:top-auto sm:bottom-0 sm:-translate-x-1/2 sm:translate-y-1/2" />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm font-bold text-ink-soft">
          {reference.companyName}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-bold leading-tight tracking-tight text-ink">
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
        <p className="mt-5 flex items-center justify-between gap-3 text-sm">
          <span className="text-ink-mute">{reference.duration}</span>
          <span className="inline-flex items-center gap-2 font-bold text-ink">
            Lire la fiche
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              style={{ background: line.color, color: line.onColor }}
            >
              <ArrowRight className="size-3.5" strokeWidth={2.25} />
            </span>
          </span>
        </p>
      </div>
    </article>
  );
}
