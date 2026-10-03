"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODALITY_KEYS,
  MODALITY_LABELS,
  activeModalities,
  type ModalityKey,
} from "./modalities";

export interface ExplorerTraining {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  modalities: Record<ModalityKey, boolean>;
}

/**
 * Modality filter + the formations as stations on one vertical violet line
 * (the Académie). Expects an ancestor with the `line-academie` class.
 */
export function FormationExplorer({
  trainings,
}: {
  trainings: ExplorerTraining[];
}) {
  const [filter, setFilter] = useState<ModalityKey | null>(null);
  const shown = trainings.filter((t) => !filter || t.modalities[filter]);

  return (
    <div>
      <div className="rounded-lg bg-panel p-5 ring-1 ring-rule sm:p-7">
        <h2 id="modality-title" className="t-h3 text-ink">
          Choisissez votre modalité
        </h2>
        <div
          role="group"
          aria-labelledby="modality-title"
          className="mt-5 flex flex-wrap gap-2.5"
        >
          <FilterChip pressed={filter === null} onClick={() => setFilter(null)}>
            Toutes
          </FilterChip>
          {MODALITY_KEYS.map((k) => (
            <FilterChip
              key={k}
              pressed={filter === k}
              onClick={() => setFilter(filter === k ? null : k)}
            >
              {MODALITY_LABELS[k]}
            </FilterChip>
          ))}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-6 text-sm font-semibold text-ink-soft"
        >
          {filter
            ? `${shown.length} formation${shown.length > 1 ? "s" : ""} en ${MODALITY_LABELS[filter].toLowerCase()}`
            : ""}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-soft">
          Aucune formation pour cette modalité pour le moment.
        </p>
      ) : (
        <ol className="mt-10 sm:mt-14">
          {shown.map((t, i) => {
            const first = i === 0;
            const last = i === shown.length - 1;
            const mods = activeModalities(t.modalities);
            return (
              <li
                key={t.slug}
                className="relative pb-5 pl-12 last:pb-0 md:pb-7 md:pl-24"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[13px] w-1.5 bg-[var(--accent)] md:left-[40px] md:w-2",
                    first
                      ? "bottom-0 top-[44px]"
                      : last
                        ? "top-0 h-[44px]"
                        : "inset-y-0",
                  )}
                />
                <span
                  aria-hidden
                  className="absolute left-0 top-7 size-8 rounded-full border-[6px] border-[var(--accent)] bg-panel ring-4 ring-enamel md:left-6 md:top-6 md:size-10 md:border-[7px]"
                />
                <article className="grid gap-6 rounded-lg bg-panel p-6 ring-1 ring-rule md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-10 md:p-8">
                  <div>
                    <h3 className="t-h3 text-ink">{t.title}</h3>
                    <p className="mt-1.5 text-sm font-bold text-[var(--accent)]">
                      {t.category}
                    </p>
                    <p className="t-body mt-3 text-ink-soft">
                      {t.shortDescription}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between gap-6">
                    <ul className="flex flex-wrap gap-2" aria-label="Modalités">
                      {mods.map((k) => (
                        <li
                          key={k}
                          className={cn(
                            "rounded-full px-3 py-1 text-sm font-semibold",
                            filter === k
                              ? "bg-[var(--accent)] text-[var(--on-accent)]"
                              : "bg-enamel text-ink ring-1 ring-inset ring-rule",
                          )}
                        >
                          {MODALITY_LABELS[k]}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/formations/${t.slug}`}
                      className="group/link inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-ink pl-5 pr-1.5 font-bold text-white transition-colors hover:bg-night-2"
                    >
                      Voir la formation
                      <span className="sr-only"> {t.title}</span>
                      <span
                        aria-hidden
                        className="grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:translate-x-0.5 motion-reduce:transition-none"
                      >
                        <ArrowRight className="size-4" strokeWidth={2} />
                      </span>
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out-expo)]",
        pressed
          ? "bg-[var(--accent)] text-[var(--on-accent)] ring-2 ring-[var(--accent)]"
          : "bg-enamel text-ink ring-2 ring-inset ring-rule hover:ring-[var(--accent)]",
      )}
    >
      {pressed && <Check aria-hidden className="size-4" strokeWidth={2} />}
      {children}
    </button>
  );
}
