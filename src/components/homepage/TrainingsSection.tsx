"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Section } from "@/components/ui/Section";
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

/* Ring geometry (SVG user units). The stage keeps an 800×600 aspect. */
const VB_W = 800;
const VB_H = 600;
const CX = VB_W / 2;
const CY = VB_H / 2;
const R = 230;
const START = -90; // first station sits at the top

type Side = "top" | "bottom" | "left" | "right";

const LABEL_SIDE: Record<Side, string> = {
  top: "lg:bottom-full lg:left-1/2 lg:mb-0.5 lg:-translate-x-1/2 lg:text-center",
  bottom: "lg:top-full lg:left-1/2 lg:mt-0.5 lg:-translate-x-1/2 lg:text-center",
  right: "lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:text-left",
  left: "lg:right-full lg:top-1/2 lg:-translate-y-1/2 lg:text-right",
};

const mod = (a: number, n: number) => ((a % n) + n) % n;

export function TrainingsSection({
  trainingsSection,
  trainings,
}: TrainingsSectionProps) {
  const uid = useId();
  const n = trainings.length;
  const step = n > 0 ? 360 / n : 0;

  const [sel, setSel] = useState(0);
  const [rot, setRot] = useState(START);
  const [filter, setFilter] = useState<ModalityKey | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const matches = (t: Training) => !filter || t.modalities[filter];
  const matchCount = trainings.filter(matches).length;

  /** The train always runs clockwise round the loop. */
  function select(i: number) {
    setSel(i);
    setRot((r) => r + mod(START + i * step - r, 360));
  }

  function applyFilter(next: ModalityKey | null) {
    setFilter(next);
    const current = trainings[sel];
    if (next && current && !current.modalities[next]) {
      const first = trainings.findIndex((t) => t.modalities[next]);
      if (first >= 0) select(first);
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
    select(next);
    tabRefs.current[next]?.focus();
  }

  const current = trainings[sel];

  return (
    <Section
      bg="gray"
      padding="md"
      aria-labelledby="trainings-title"
      className="line-academie overflow-hidden"
    >
      <div className="grid gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center xl:gap-x-16">
        {/* Heading, intro and modality filters */}
        <div className="lg:col-start-2 lg:row-start-1">
          <h2 id="trainings-title" className="t-h2">
            {trainingsSection.title}
          </h2>
          {trainingsSection.intro && (
            <p className="t-lead mt-4">{trainingsSection.intro}</p>
          )}
          {n > 0 && (
            <div
              role="group"
              aria-label="Filtrer les formations par modalité"
              className="mt-6 flex flex-wrap items-center gap-2"
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
                      "inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold ring-2 ring-inset transition-colors duration-300",
                      on
                        ? "bg-ink text-white ring-ink"
                        : "bg-panel text-ink ring-ink/25 hover:ring-ink",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
              <p role="status" className="sr-only">
                {filter
                  ? `${matchCount} formation${matchCount > 1 ? "s" : ""} en ${
                      MODALITIES.find((m) => m.key === filter)?.label
                    }`
                  : ""}
              </p>
            </div>
          )}
        </div>

        {n > 0 && (
          <div className="relative lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:aspect-[800/600]">
            {/* The circular line */}
            <svg
              aria-hidden
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="pointer-events-none absolute inset-0 hidden size-full lg:block"
            >
              <circle
                cx={CX}
                cy={CY}
                r={R - 7}
                fill="var(--accent)"
                fillOpacity={0.06}
              />
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={14}
              />
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="#fff"
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeDasharray="2 16"
                strokeLinecap="round"
              />
              <g
                className={styles.train}
                style={{
                  transform: `rotate(${rot}deg)`,
                  transformOrigin: `${CX}px ${CY}px`,
                }}
              >
                <rect
                  x={CX + R - 11}
                  y={CY - 26}
                  width={22}
                  height={52}
                  rx={11}
                  fill="var(--color-ink)"
                  stroke="#fff"
                  strokeWidth={3}
                />
                <rect x={CX + R - 4} y={CY - 16} width={8} height={9} rx={2} fill="#fff" />
                <rect x={CX + R - 4} y={CY + 6} width={8} height={9} rx={2} fill="#fff" />
              </g>
            </svg>

            {/* Ring centre: the Académie roundel */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center lg:flex"
            >
              <span className="grid size-16 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] ring-[6px] ring-panel">
                <GraduationCap className="size-8" strokeWidth={1.75} />
              </span>
              <span className="t-station text-sm font-extrabold text-ink">
                Académie
              </span>
              <span className="text-sm text-ink-mute">
                {n} formation{n > 1 ? "s" : ""}
              </span>
            </div>

            {/* Stations (a vertical list on phones, ringed dots on the loop) */}
            <div
              role="tablist"
              aria-label="Formations de l'Académie"
              onKeyDown={onKeyDown}
              className="relative before:absolute before:bottom-7 before:left-[1.25rem] before:top-7 before:w-1 before:rounded before:bg-[var(--accent)] lg:absolute lg:inset-0 lg:before:hidden"
            >
              {trainings.map((t, i) => {
                const angle = ((START + i * step) * Math.PI) / 180;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const side: Side =
                  Math.abs(cos) < 0.3 ? (sin < 0 ? "top" : "bottom") : cos > 0 ? "right" : "left";
                const x = ((CX + R * cos) / VB_W) * 100;
                const y = ((CY + R * sin) / VB_H) * 100;
                const selected = i === sel;
                const dim = !matches(t);
                return (
                  <button
                    key={t.slug}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${i}`}
                    aria-selected={selected}
                    aria-controls={`${uid}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i)}
                    style={
                      {
                        "--x": `${x}%`,
                        "--y": `${y}%`,
                      } as React.CSSProperties
                    }
                    className={cn(
                      "group relative flex min-h-14 w-full items-center gap-3 rounded-lg pr-3 text-left transition-colors duration-300",
                      "lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:size-11 lg:min-h-0 lg:w-11 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:justify-center lg:rounded-full lg:p-0",
                      selected ? "bg-panel lg:bg-transparent" : "hover:bg-panel/60 lg:hover:bg-transparent",
                    )}
                  >
                    <span className="grid size-11 shrink-0 place-items-center">
                      <span
                        aria-hidden
                        className={cn(
                          "block size-6 rounded-full border-[5px] transition-[transform,background-color,border-color,opacity] duration-300 ease-[var(--ease-out-expo)] group-hover:scale-110",
                          selected
                            ? "scale-125 border-ink bg-[var(--accent)]"
                            : "border-[var(--accent)] bg-panel",
                          dim && "opacity-35",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "t-station text-[0.9375rem] leading-tight transition-opacity duration-300 lg:absolute lg:w-max lg:max-w-[8.5rem] lg:text-sm",
                        LABEL_SIDE[side],
                        selected ? "font-extrabold text-ink" : "font-semibold text-ink-soft",
                        dim && "opacity-45",
                      )}
                    >
                      {t.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* The selected formation, next to the loop */}
        {current && (
          <div
            role="tabpanel"
            id={`${uid}-panel`}
            aria-labelledby={`${uid}-tab-${sel}`}
            tabIndex={0}
            className="rounded-lg bg-panel p-5 ring-1 ring-rule shadow-[0_14px_36px_-18px_rgba(11,27,58,0.35)] sm:p-6 lg:col-start-2 lg:row-start-2"
          >
            <div key={current.slug} className={styles.swap}>
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]"
                >
                  <GraduationCap className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-balance text-ink">
                  {current.title}
                </h3>
              </div>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                {current.shortDescription}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <ul className="flex flex-wrap gap-1.5" aria-label="Modalités">
                  {MODALITIES.filter((m) => current.modalities[m.key]).map((m) => (
                    <li
                      key={m.key}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                        filter === m.key
                          ? "bg-[var(--accent)] text-[var(--on-accent)] ring-transparent"
                          : "bg-enamel text-ink ring-rule",
                      )}
                    >
                      {m.label}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/formations/${current.slug}`}
                  className="group/l inline-flex min-h-11 items-center gap-2 rounded-full bg-ink py-1 pl-4 pr-1 text-sm font-bold text-white transition-colors duration-300 hover:bg-night-2"
                >
                  Voir le programme
                  <span
                    aria-hidden
                    className="grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/l:translate-x-0.5"
                  >
                    <ArrowRight className="size-4" strokeWidth={2} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:col-start-2 lg:row-start-3">
          <CTAButton
            intent="training"
            label="Demander une formation entreprise"
            block="training-section"
            size="lg"
          />
          <Link
            href="/formations"
            className="inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-bold text-ink ring-2 ring-inset ring-ink transition-colors duration-300 hover:bg-ink hover:text-white"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    </Section>
  );
}
