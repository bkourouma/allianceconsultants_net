"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, TramFront } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { SolutionFeatureGroup } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

interface FeatureGridProps {
  groups: SolutionFeatureGroup[];
}

/**
 * Station-by-station explorer. Each feature group is a station on the line;
 * selecting one brings the train there and lists what the station serves.
 * (Name kept for the existing import; it is no longer a card grid.)
 */
export function FeatureGrid({ groups }: FeatureGridProps) {
  const [index, setIndex] = useState(0);
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = groups.length;
  const active = groups[index];
  const prev = index > 0 ? groups[index - 1] : null;
  const next = index < n - 1 ? groups[index + 1] : null;

  function select(i: number, focus = false) {
    setIndex(i);
    if (focus) tabRefs.current[i]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let target = index;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = (index + 1) % n;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = (index - 1 + n) % n;
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    select(target, true);
  }

  return (
    <Section id="fonctionnalites" bg="gray" padding="md" aria-labelledby="fonctionnalites-title">
      <SectionHead
        id="fonctionnalites-title"
        title="Les fonctionnalités, station par station"
        intro="Choisissez une station : vous voyez ce qu’elle dessert."
      />

      <div className="mt-10" style={{ "--n": n } as CSSProperties}>
        <div
          role="tablist"
          aria-label="Domaines fonctionnels"
          onKeyDown={onKeyDown}
          className="relative grid md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        >
          {/* rails */}
          <span
            aria-hidden
            className="absolute bottom-6 left-[9px] top-6 w-1.5 bg-[var(--accent)] md:hidden"
          />
          <span
            aria-hidden
            className="absolute left-3 top-[9px] hidden h-1.5 bg-[var(--accent)] md:block md:[width:calc(100%*(var(--n)_-_1)/var(--n))]"
          />
          {/* the train */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-[-9px] z-10 hidden size-[42px] place-items-center rounded-full border-[3px] border-[var(--accent)] bg-ink text-white transition-[left] duration-[600ms] ease-[var(--ease-out-expo)] md:grid"
            style={{ left: `calc(100% * ${index} / ${n} - 9px)` }}
          >
            <TramFront className="size-5" strokeWidth={2} />
          </span>

          {groups.map((g, i) => {
            const selected = i === index;
            return (
              <button
                key={g.title}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`${uid}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className="relative flex min-h-12 items-start gap-4 py-2 text-left md:block md:pb-0 md:pr-5 md:pt-12"
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative z-[1] size-6 shrink-0 rounded-full border-[5px] transition-[background-color,border-color] duration-300 md:absolute md:left-0 md:top-0",
                    selected
                      ? "border-ink bg-[var(--accent)]"
                      : "border-[var(--accent)] bg-panel",
                  )}
                />
                <span
                  className={cn(
                    "block font-display text-base font-bold leading-snug transition-colors duration-300 sm:text-[1.0625rem]",
                    selected
                      ? "text-ink underline decoration-[3px] decoration-[var(--accent)] underline-offset-[6px]"
                      : "text-ink-soft",
                  )}
                >
                  {g.title}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={index}
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${index}`}
          className={cn(
            "mt-8 rounded-md bg-panel p-6 sm:p-8 lg:p-10",
            s.panelIn,
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="t-h3 text-ink">{active.title}</h3>
            <p className="t-num text-sm font-semibold text-ink-mute">
              Station {index + 1} sur {n}
            </p>
          </div>

          <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
            {active.features.map((f) => (
              <li
                key={f.title}
                className="grid grid-cols-[auto_1fr] gap-x-3 border-t border-rule py-5"
              >
                <span
                  aria-hidden
                  className="mt-[0.45rem] size-3 rounded-full border-[3px] border-[var(--accent)] bg-panel"
                />
                <div>
                  <h4 className="text-base font-bold leading-snug text-ink">
                    {f.title}
                  </h4>
                  <p className="t-body mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {f.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-5">
            {prev ? (
              <button
                type="button"
                onClick={() => select(index - 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-ink ring-2 ring-inset ring-ink transition-colors hover:bg-ink hover:text-white"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
                <span className="sr-only">Station précédente : </span>
                {prev.title}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button
                type="button"
                onClick={() => select(index + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white transition-colors hover:bg-night-2"
              >
                <span className="sr-only">Station suivante : </span>
                {next.title}
                <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
