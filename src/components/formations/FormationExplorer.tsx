"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import fx from "@/components/services/fx.module.css";
import {
  MODALITY_KEYS,
  MODALITY_LABELS,
  activeModalities,
  type ModalityKey,
} from "./modalities";
import { PassBarcode } from "./PassBarcode";

export interface ExplorerTraining {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  modalities: Record<ModalityKey, boolean>;
}

/**
 * Modality filter + the formations drawn as access passes (cartes d'accès).
 * Expects an ancestor with the `line-academie` class.
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
      <div className="border-y-2 border-ink py-6 md:py-7">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div>
            <h2 id="modality-title" className="t-h3 text-ink">
              Choisissez votre modalité
            </h2>
            <p className="mt-1.5 max-w-[34ch] text-ink-soft">
              Les passes qui s&apos;y prêtent restent sur la table.
            </p>
          </div>
          <div>
            <div
              role="group"
              aria-labelledby="modality-title"
              className="flex flex-wrap gap-2.5"
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
              className="mt-3 min-h-5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-mute"
            >
              {filter
                ? `${shown.length} formation${shown.length > 1 ? "s" : ""} en ${MODALITY_LABELS[filter].toLowerCase()}`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-soft">
          Aucune formation pour cette modalité pour le moment.
        </p>
      ) : (
        <ul className="mt-10 grid gap-7 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-8">
          {shown.map((t, i) => {
            const mods = activeModalities(t.modalities);
            return (
              <li
                key={`${filter ?? "all"}-${t.slug}`}
                className={fx.passIn}
                style={{ "--d": `${i * 50}ms` } as React.CSSProperties}
              >
                <article
                  className={cn(
                    "coupon relative flex h-full flex-col overflow-hidden",
                    fx.pass,
                  )}
                >
                  <div className="relative h-[4.25rem] bg-[var(--accent)] text-[var(--on-accent)]">
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-3 h-3 w-14 -translate-x-1/2 rounded-full border-2 border-ink bg-enamel"
                    />
                    <span className="absolute bottom-2.5 left-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
                      Pass Académie
                    </span>
                    <PassBarcode
                      seed={t.slug}
                      className="absolute bottom-2.5 right-4 h-5 w-[4.5rem] text-white"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <p className="t-field text-carbon!">{t.category}</p>
                    <h3 className="mt-2 font-display text-[1.875rem] font-bold leading-[1.02] text-ink">
                      {t.title}
                    </h3>
                    <p className="mt-3 flex-1 text-ink-soft">
                      {t.shortDescription}
                    </p>
                    <ul
                      className="mt-5 flex flex-wrap gap-2"
                      aria-label="Modalités"
                    >
                      {mods.map((k) => (
                        <li
                          key={k}
                          className={cn(
                            "inline-flex min-h-8 items-center rounded-[3px] border-2 px-2.5 font-display text-[0.9375rem] font-bold uppercase leading-none tracking-[0.05em] transition-colors duration-200",
                            filter === k
                              ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                              : "border-ink bg-white text-ink",
                          )}
                        >
                          {MODALITY_LABELS[k]}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-3">
                    <p className="t-field max-w-[14ch] leading-snug">
                      Programme et tarifs sur demande
                    </p>
                    <Link
                      href={`/formations/${t.slug}`}
                      className="group/link inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-ink px-4 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-white transition-colors duration-200 hover:bg-night-2 after:absolute after:inset-0 after:content-['']"
                    >
                      Voir
                      <span className="sr-only"> la formation {t.title}</span>
                      <ArrowRight
                        aria-hidden
                        strokeWidth={2.25}
                        className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/link:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
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
        "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 px-4 font-display text-[1.0625rem] font-bold uppercase tracking-[0.05em] transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-expo)] active:translate-y-px",
        pressed
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
          : "border-ink bg-panel text-ink hover:bg-ink hover:text-white",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-[2px] border-2",
          pressed
            ? "border-white bg-white text-[var(--accent)]"
            : "border-ink text-transparent",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
      {children}
    </button>
  );
}
