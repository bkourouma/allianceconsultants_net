"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { cn } from "@/lib/utils";
import type { Homepage, Training } from "@/lib/validators/content";
import styles from "./lower/Academie.module.css";

interface TrainingsSectionProps {
  trainingsSection: Homepage["trainingsSection"];
  trainings: Training[];
}

type ModalityKey = "presentiel" | "distanciel" | "intra";

const MODALITIES: { key: ModalityKey; label: string }[] = [
  { key: "presentiel", label: "Présentiel" },
  { key: "distanciel", label: "Distanciel" },
  { key: "intra", label: "Intra-entreprise" },
];

const pad = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Formations as cartes d'accès: six access passes standing in a ruled rack.
 * Modality chips dim the passes that do not match; selecting a pass lifts it
 * and opens its detail on a larger pass with a perforated tear edge.
 */
export function TrainingsSection({
  trainingsSection,
  trainings,
}: TrainingsSectionProps) {
  const uid = useId();
  const n = trainings.length;

  const [sel, setSel] = useState(0);
  const [filter, setFilter] = useState<ModalityKey | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const matches = (t: Training) => !filter || t.modalities[filter];
  const matchCount = trainings.filter(matches).length;
  const filterLabel = MODALITIES.find((m) => m.key === filter)?.label;

  function applyFilter(next: ModalityKey | null) {
    setFilter(next);
    const current = trainings[sel];
    if (next && current && !current.modalities[next]) {
      const first = trainings.findIndex((t) => t.modalities[next]);
      if (first >= 0) setSel(first);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!forward && !back && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const enabled = trainings.map((_, i) => i).filter((i) => matches(trainings[i]));
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(sel);
    let next: number;
    if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    else if (forward) next = enabled[(pos + 1) % enabled.length];
    else next = enabled[(pos - 1 + enabled.length) % enabled.length];
    setSel(next);
    tabRefs.current[next]?.focus();
  }

  const current = trainings[sel];

  return (
    <section
      aria-labelledby="trainings-title"
      className="line-academie bg-enamel py-16 text-ink lg:py-24"
    >
      <div className="wrap">
        {/* Heading, intro and modality filters */}
        <div className="grid gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <h2 id="trainings-title" className="t-h2">
              {trainingsSection.title}
            </h2>
            {trainingsSection.intro && (
              <p className="t-lead mt-4">{trainingsSection.intro}</p>
            )}
          </div>

          {n > 0 && (
            <div
              role="group"
              aria-label="Filtrer les formations par modalité"
              className="flex flex-wrap items-center gap-2 lg:justify-end"
            >
              {MODALITIES.map(({ key, label }) => {
                const on = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => applyFilter(on ? null : key)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 border-ink px-4 font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)]",
                      on
                        ? "bg-ink text-white"
                        : "bg-panel text-ink hover:bg-ink hover:text-white",
                    )}
                  >
                    {on && <Check aria-hidden className="size-3.5" strokeWidth={2.5} />}
                    {label}
                  </button>
                );
              })}
              <p role="status" className="sr-only">
                {filter
                  ? `${matchCount} formation${matchCount > 1 ? "s" : ""} en ${filterLabel}`
                  : ""}
              </p>
              <span aria-hidden className="!text-xs t-field ml-1 w-full lg:ml-0 lg:w-auto">
                {filter
                  ? `${matchCount} sur ${n} formations en ${filterLabel}`
                  : `${n} formation${n > 1 ? "s" : ""}`}
              </span>
            </div>
          )}
        </div>

        {n > 0 && (
          <>
            {/* The rack: six passes, each standing on a ruled shelf */}
            <div
              role="tablist"
              aria-label="Formations de l'Académie"
              onKeyDown={onKeyDown}
              className="mt-14 grid grid-cols-2 gap-x-4 gap-y-9 pb-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-3"
            >
              {trainings.map((t, i) => {
                const selected = i === sel;
                const dim = !matches(t);
                return (
                  <div key={t.slug} className={cn(styles.shelf, "relative pt-3")}>
                    <button
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${uid}-tab-${i}`}
                      aria-selected={selected}
                      aria-controls={`${uid}-panel`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setSel(i)}
                      className={cn(
                        styles.pass,
                        "coupon flex min-h-[10.5rem] w-full flex-col items-start px-3 pb-3 pt-2.5 text-left",
                        dim && "opacity-40",
                      )}
                    >
                      <span aria-hidden className="flex w-full items-center justify-center">
                        <span className={styles.slot} />
                      </span>
                      <span
                        aria-hidden
                        className="mt-2 flex w-full items-center justify-between"
                      >
                        <span className="t-num carbon font-display text-4xl font-extrabold italic leading-none">
                          {pad(i)}
                        </span>
                        <span
                          className={cn(
                            "size-2.5 rounded-full transition-colors duration-300",
                            selected ? "bg-red" : "border-2 border-ink/35",
                          )}
                        />
                      </span>
                      <span className="mt-3 flex-1 font-display text-[1.3125rem] font-bold leading-[1.05] text-ink">
                        {t.category}
                      </span>
                      <span aria-hidden className={cn(styles.bars, "mt-3 w-full")} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* The selected pass, enlarged, with its tear-off stub */}
            {current && (
              <div
                role="tabpanel"
                id={`${uid}-panel`}
                aria-labelledby={`${uid}-tab-${sel}`}
                tabIndex={0}
                className="coupon mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem]"
              >
                <div key={current.slug} className={cn(styles.swap, "min-w-0")}>
                  <div className="flex items-center justify-between gap-3 rounded-tl-[2px] bg-ink px-5 py-2.5 text-white lg:rounded-tr-none">
                    <span className="!text-xs t-field !text-white">
                      Carte d&apos;accès<span className="hidden sm:inline"> · Académie</span>
                    </span>
                    <span className="!text-xs t-field shrink-0 whitespace-nowrap rounded-[2px] bg-[var(--accent)] px-2 py-0.5 !text-[var(--on-accent)]">
                      Formation {pad(sel)} / {pad(n - 1)}
                    </span>
                  </div>

                  <div className="p-5 sm:p-8">
                    <h3 className="t-h3 text-ink lg:text-[2.5rem]">{current.title}</h3>
                    <p className="t-lead mt-4">{current.shortDescription}</p>

                    <p className="!text-xs t-field mt-7">Modalités</p>
                    <ul className="mt-2.5 flex flex-wrap gap-2" aria-label="Modalités">
                      {MODALITIES.map((m) => {
                        const on = current.modalities[m.key];
                        return (
                          <li
                            key={m.key}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-[3px] border-2 px-2.5 py-1 text-sm font-semibold",
                              on
                                ? "border-ink bg-panel text-ink"
                                : "border-dashed border-rule text-ink-mute line-through",
                              on && filter === m.key && "bg-[var(--accent)] text-[var(--on-accent)]",
                            )}
                          >
                            {on ? (
                              <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
                            ) : (
                              <Minus aria-hidden className="size-3.5" strokeWidth={2.5} />
                            )}
                            {m.label}
                            {!on && <span className="sr-only"> (non proposé)</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div
                  className={cn(
                    styles.stub,
                    "flex flex-row flex-wrap items-center justify-between gap-4 rounded-br-[2px] px-5 py-5 sm:px-8 lg:flex-col lg:items-start lg:justify-between lg:px-6 lg:py-6",
                  )}
                >
                  <div>
                    <p className="!text-xs t-field">Coupon détachable</p>
                    <p
                      aria-hidden
                      className="t-num carbon mt-1 font-display text-6xl font-extrabold italic leading-[0.9] lg:text-7xl"
                    >
                      {pad(sel)}
                    </p>
                  </div>
                  <Link
                    href={`/formations/${current.slug}`}
                    className="group/l inline-flex min-h-11 items-center gap-2.5 rounded-[3px] bg-ink px-4 py-2 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-white no-underline transition-colors duration-200 hover:bg-night-2"
                  >
                    Voir le programme
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/l:translate-x-0.5"
                      strokeWidth={2.25}
                    />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
          <CTAButton
            intent="training"
            label="Demander une formation entreprise"
            block="training-section"
            size="lg"
            className="h-auto min-h-14 w-full py-2.5 text-center sm:w-auto"
          />
          <Link
            href="/formations"
            className="inline-flex h-14 items-center justify-center rounded-[3px] px-8 font-display text-[1.25rem] font-bold uppercase tracking-[0.06em] text-ink no-underline ring-2 ring-inset ring-ink transition-colors duration-200 hover:bg-ink hover:text-white"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
