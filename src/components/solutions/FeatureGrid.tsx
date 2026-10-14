"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SolutionFeatureGroup } from "@/lib/validators/content";
import { CouponBand } from "./CouponBand";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

interface FeatureGridProps {
  groups: SolutionFeatureGroup[];
}

const NOTCH =
  "before:absolute before:-left-[2px] before:-top-[10px] before:h-5 before:w-[10px] before:rounded-r-full before:border-2 before:border-l-0 before:border-ink before:bg-enamel before:content-[''] after:absolute after:-right-[2px] after:-top-[10px] after:h-5 after:w-[10px] after:rounded-l-full after:border-2 after:border-r-0 after:border-ink after:bg-enamel after:content-['']";

/**
 * Coupon fold-out explorer. The groups are an index of small tickets; picking
 * one unfolds its features on a coupon whose rows are separated by perforations.
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
    <section
      id="fonctionnalites"
      aria-labelledby="fonctionnalites-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap">
        <header className="max-w-3xl">
          <h2 id="fonctionnalites-title" className="t-h2 text-ink">
            Les fonctionnalités
          </h2>
          <p className="t-lead mt-4">
            Choisissez un domaine : ses fonctionnalités se déplient sur le
            coupon.
          </p>
        </header>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
          <div
            role="tablist"
            aria-label="Domaines fonctionnels"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="flex flex-col gap-2.5"
          >
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
                  className={cn(
                    "grid min-h-14 grid-cols-[2.75rem_minmax(0,1fr)] items-stretch overflow-hidden rounded-[3px] border-2 border-ink text-left transition-[background-color,color,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)]",
                    selected
                      ? "bg-ink text-white shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] lg:translate-x-2"
                      : "bg-panel text-ink hover:-translate-y-0.5",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid place-items-center border-r-2 border-ink font-display text-2xl font-extrabold",
                      selected ? "bg-white text-ink" : "carbon bg-panel",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex flex-col justify-center gap-0.5 px-3.5 py-2">
                    <span className="font-display text-[1.0625rem] font-bold leading-snug sm:text-lg">
                      {g.title}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[0.625rem] font-medium uppercase tracking-[0.08em]",
                        selected ? "text-white/80" : "text-ink-mute",
                      )}
                    >
                      {g.features.length} fonctionnalités
                    </span>
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
            className="coupon"
          >
            <CouponBand
              titleAs="h3"
              no={index + 1}
              title={active.title}
              chip={`${index + 1} / ${n}`}
            />
            <ul>
              {active.features.map((f, i) => (
                <li
                  key={f.title}
                  style={{ "--i": i } as React.CSSProperties}
                  className={cn(
                    "relative grid gap-x-8 gap-y-1.5 px-6 py-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:px-8 sm:py-6",
                    s.foldRow,
                    i > 0 && "border-t-2 border-dashed border-ink",
                    i > 0 && NOTCH,
                  )}
                >
                  <h4 className="font-display text-xl font-bold leading-tight text-ink">
                    {f.title}
                  </h4>
                  <p className="t-body text-[0.9375rem] leading-relaxed text-ink-soft">
                    {f.description}
                  </p>
                </li>
              ))}
            </ul>

            <hr className="tear" />
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8">
              {prev ? (
                <button
                  type="button"
                  onClick={() => select(index - 1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[3px] px-4 font-display text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-ink ring-2 ring-inset ring-ink transition-colors hover:bg-ink hover:text-white"
                >
                  <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
                  <span className="sr-only">Domaine précédent : </span>
                  {prev.title}
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => select(index + 1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-ink px-4 font-display text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-night-2"
                >
                  <span className="sr-only">Domaine suivant : </span>
                  {next.title}
                  <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
