"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { getLine, lineStyle, type NetworkLine } from "@/lib/network";
import type { Solution } from "@/lib/validators/content";
import { cn } from "@/lib/utils";
import { STATIONS } from "./lineData";
import { Stations } from "./Stations";
import { PREVIEWS } from "./previews";
import styles from "./Lineup.module.css";

/** Neutral ink accent for a solution that has no line in the network model. */
const NEUTRAL_STYLE = {
  "--accent": "#0b1b3a",
  "--on-accent": "#ffffff",
} as CSSProperties;

interface LineupProps {
  solutions: Solution[];
}

export function Lineup({ solutions }: LineupProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(solutions[0]?.slug ?? null);
  // Previews mount lazily on first open, then keep their state.
  const [seen, setSeen] = useState<Set<string>>(
    () => new Set(solutions[0] ? [solutions[0].slug] : []),
  );
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function toggle(slug: string) {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    if (!next) return;
    setSeen((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
    // A row above may have collapsed and pushed this one off-screen: bring it back.
    window.setTimeout(() => {
      const el = rowRefs.current[next];
      if (!el) return;
      if (el.getBoundingClientRect().top < 0) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
    }, 500);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = solutions.length - 1;
    let target = -1;
    if (e.key === "ArrowDown") target = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp") target = index === 0 ? last : index - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;
    if (target < 0) return;
    e.preventDefault();
    btnRefs.current[solutions[target].slug]?.focus();
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-4">
      {solutions.map((solution, i) => {
        const line = getLine(solution.slug);
        return (
          <li
            key={solution.slug}
            ref={(el) => {
              rowRefs.current[solution.slug] = el;
            }}
            className="scroll-mt-24"
          >
            <Row
              solution={solution}
              line={line}
              open={openSlug === solution.slug}
              mounted={seen.has(solution.slug)}
              onToggle={() => toggle(solution.slug)}
              onKeyDown={(e) => onKeyDown(e, i)}
              buttonRef={(el) => {
                btnRefs.current[solution.slug] = el;
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}

interface RowProps {
  solution: Solution;
  line: NetworkLine | undefined;
  open: boolean;
  mounted: boolean;
  onToggle: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function Row({ solution, line, open, mounted, onToggle, onKeyDown, buttonRef }: RowProps) {
  const slug = solution.slug;
  const btnId = `line-${slug}-btn`;
  const panelId = `line-${slug}-panel`;
  const sector = line?.sector ?? solution.category;
  const stations = line ? STATIONS[line.id] : [];
  const Preview = line ? PREVIEWS[line.id] : undefined;

  return (
    <article
      data-open={open}
      style={{ ...(line ? lineStyle(line.id) : NEUTRAL_STYLE) }}
      className={cn(
        styles.row,
        "overflow-hidden rounded-lg",
        open
          ? "bg-[var(--accent)] text-[var(--on-accent)] [--stroke:var(--on-accent)]"
          : "bg-panel text-ink shadow-[0_1px_0_var(--color-rule)] [--stroke:var(--accent)] hover:shadow-[0_10px_28px_-20px_rgba(7,18,43,0.55)]",
      )}
    >
      {/* Departure-board row: band | description | stations | chevron */}
      <div
        className={cn(
          "relative grid lg:items-stretch",
          open
            ? "lg:grid-cols-[minmax(18.5rem,1.15fr)_minmax(0,2.85fr)_auto]"
            : "lg:grid-cols-[minmax(18.5rem,1.15fr)_minmax(0,1.35fr)_minmax(0,1.5fr)_auto]",
        )}
      >
        <h3 className="m-0">
          <button
            ref={buttonRef}
            id={btnId}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            onKeyDown={onKeyDown}
            className={cn(
              styles.headBtn,
              "flex h-full min-h-[4.5rem] w-full items-center gap-3.5 px-4 py-4 pr-16 text-left lg:px-6 lg:py-6 lg:pr-6",
              "bg-[var(--accent)] text-[var(--on-accent)]",
              // the whole row is the hit area
              "after:absolute after:inset-0 after:content-['']",
            )}
          >
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--on-accent)] font-display text-xl font-extrabold leading-none text-[var(--accent)]"
            >
              {line?.glyph ?? solution.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block text-balance break-words font-display text-[clamp(1.5rem,1.15rem+1.1vw,2rem)] font-extrabold leading-none tracking-[-0.03em]">
                {solution.name}
              </span>
              <span className="mt-1.5 block text-[0.8125rem] font-semibold leading-tight">
                {sector}
              </span>
            </span>
          </button>
        </h3>

        <p
          className={cn(
            "m-0 hidden self-center px-4 py-6 text-[0.9375rem] leading-snug text-pretty lg:block",
            open ? "max-w-[68ch]" : "max-w-[44ch]",
          )}
        >
          {solution.shortDescription}
        </p>

        {/* the open panel carries the stations as a vertical route instead */}
        {!open &&
          (stations.length > 0 ? (
            <div className="hidden self-center px-4 py-6 lg:block">
              <Stations stations={stations} />
            </div>
          ) : (
            <span className="hidden lg:block" />
          ))}

        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-4 top-[1.0625rem] grid size-10 place-items-center rounded-full ring-2 ring-inset ring-current",
            "lg:static lg:mr-6 lg:self-center",
            open ? "text-[var(--on-accent)]" : "text-[var(--on-accent)] lg:text-ink",
          )}
        >
          <ChevronDown
            className={cn(
              "size-5 transition-transform duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
              open && "rotate-180",
            )}
            strokeWidth={2.25}
          />
        </span>
      </div>

      {/* Open panel: pitch + actions | live synthetic preview */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        data-open={open}
        className={styles.panel}
      >
        <div className={styles.inner}>
          <div
            className={cn(
              "grid gap-6 px-4 pb-6 pt-2 lg:px-6 lg:pb-8",
              Preview && "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10",
            )}
          >
            <div className="flex flex-col gap-6 lg:justify-between lg:gap-8 lg:py-1">
              {/* the head hides these on phones, so repeat them here */}
              <p className="m-0 text-[0.9375rem] leading-snug lg:hidden">{solution.shortDescription}</p>
              {stations.length > 0 && <Stations stations={stations} className="lg:hidden" />}

              <p className="m-0 max-w-[40ch] font-display text-[clamp(1.25rem,1.05rem+0.7vw,1.625rem)] font-bold leading-tight tracking-[-0.02em] text-balance">
                {solution.mainBenefit}
              </p>

              {stations.length > 0 && (
                <Stations stations={stations} orientation="column" className="hidden lg:grid" />
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
                <CTAButton
                  intent="demo"
                  label="Demander une démo"
                  solutionSlug={slug}
                  block="solution-card"
                  size="md"
                />
                <Link
                  href={`/solutions/${slug}`}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-bold ring-2 ring-inset ring-current transition-colors duration-200 hover:bg-[var(--on-accent)] hover:text-[var(--accent)] motion-reduce:transition-none"
                >
                  En savoir plus
                  <span className="sr-only"> sur {solution.name}</span>
                </Link>
                {solution.externalUrl && (
                  <a
                    href={solution.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 px-1 text-[0.9375rem] font-bold underline decoration-2 underline-offset-4"
                  >
                    Site du produit
                    <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                    <span className="sr-only"> (ouvre le site de {solution.name} dans un nouvel onglet)</span>
                  </a>
                )}
              </div>
            </div>

            {Preview && (
              <div className={cn(styles.preview, "min-h-[30rem] sm:min-h-[27rem]")}>{mounted ? <Preview name={solution.name} /> : null}</div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
