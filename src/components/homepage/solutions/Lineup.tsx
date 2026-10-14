"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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

/** Neutral ink accent for a solution that has no entry in the product model. */
const NEUTRAL_STYLE = {
  "--accent": "#0f2a5a",
  "--on-accent": "#ffffff",
} as CSSProperties;

interface LineupProps {
  solutions: Solution[];
}

type StampLabel = "Ouvert" | "Consulté";

/**
 * "Les six coupons" — one coupon per solution, stacked as a ledger. Each is an
 * accordion: opening a coupon folds it out to reveal an illustrative product
 * preview, and a red rubber stamp presses onto it (one at a time).
 */
export function Lineup({ solutions }: LineupProps) {
  // First coupon open by default; phones start closed (see effect below).
  const [openSlug, setOpenSlug] = useState<string | null>(solutions[0]?.slug ?? null);
  // Previews mount lazily on first open, then keep their state.
  const [seen, setSeen] = useState<Set<string>>(
    () => new Set(solutions[0] ? [solutions[0].slug] : []),
  );
  // The stamp only appears after a visitor opens a coupon themselves.
  const [stamp, setStamp] = useState<{ slug: string; label: StampLabel } | null>(null);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setOpenSlug(null);
      setSeen(new Set());
    }
  }, []);

  function toggle(slug: string) {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    if (!next) return;
    setStamp({ slug: next, label: seen.has(next) ? "Consulté" : "Ouvert" });
    setSeen((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
    // A coupon above may have folded up and pushed this one off-screen: bring it back.
    window.setTimeout(() => {
      const el = rowRefs.current[next];
      if (!el) return;
      if (el.getBoundingClientRect().top < 0) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
    }, 540);
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
    <ul className="m-0 flex list-none flex-col gap-4 p-0 lg:gap-5">
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
            <Coupon
              index={i}
              solution={solution}
              line={line}
              open={openSlug === solution.slug}
              mounted={seen.has(solution.slug)}
              stampLabel={stamp?.slug === solution.slug ? stamp.label : null}
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

interface CouponProps {
  index: number;
  solution: Solution;
  line: NetworkLine | undefined;
  open: boolean;
  mounted: boolean;
  stampLabel: StampLabel | null;
  onToggle: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function Coupon({
  index,
  solution,
  line,
  open,
  mounted,
  stampLabel,
  onToggle,
  onKeyDown,
  buttonRef,
}: CouponProps) {
  const slug = solution.slug;
  const btnId = `coupon-${slug}-btn`;
  const panelId = `coupon-${slug}-panel`;
  const sector = line?.sector ?? solution.category;
  const modules = line ? STATIONS[line.id] : [];
  const Preview = line ? PREVIEWS[line.id] : undefined;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      data-open={open}
      style={line ? lineStyle(line.id) : NEUTRAL_STYLE}
      className={cn(styles.row, "coupon relative text-ink")}
    >
      {/* Head: a compact wallet row. The button's ::after covers the whole row so
          it is one big hit area; « En savoir plus » sits above it. */}
      <div className={cn(styles.head, "relative grid")}>
        <span
          aria-hidden
          className={cn(
            styles.numeral,
            "carbon t-num grid place-items-center border-r-2 border-ink font-display font-extrabold leading-none",
          )}
        >
          {number}
        </span>

        <div className={cn(styles.title, "min-w-0")}>
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
                "block w-full cursor-pointer p-0 text-left",
                "after:absolute after:inset-0 after:content-['']",
              )}
            >
              <span className="block break-words font-display text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] font-bold leading-none">
                {solution.name}
              </span>
              <span className={cn(styles.field, "t-field mt-1.5 flex items-center gap-2")}>
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-[1px] bg-[var(--accent)] ring-1 ring-ink/70"
                />
                {sector}
              </span>
            </button>
          </h3>
        </div>

        <p className={cn(styles.pitch, "m-0 text-[0.9375rem] leading-snug text-ink-soft")}>
          {line?.pitch ?? solution.shortDescription}
        </p>

        <div className={cn(styles.more, "flex items-center")}>
          <Link
            href={`/solutions/${slug}`}
            className="relative z-10 inline-flex min-h-11 items-center font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink underline decoration-2 underline-offset-[5px] hover:decoration-red"
          >
            En savoir plus
            <span className="sr-only"> sur {solution.name}</span>
          </Link>
        </div>

        {/* fold indicator: a ruled square, navy-filled when open */}
        <span aria-hidden className={cn(styles.chev, "pointer-events-none grid place-items-center")}>
          <span
            className={cn(
              "grid size-10 place-items-center border-2 border-ink transition-colors duration-200 motion-reduce:transition-none",
              open ? "bg-ink text-white" : "bg-panel text-ink",
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
        </span>
      </div>

      {/* Fold-out: perforation, benefit + modules + actions | illustrative preview */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        data-open={open}
        className={styles.panel}
      >
        <div className={styles.inner}>
          <hr className="tear m-0" />
          <div
            className={cn(
              "grid gap-6 p-4 lg:p-6",
              Preview && "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10",
            )}
          >
            <div className="flex flex-col gap-6 lg:justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className={cn(styles.field, "t-field block")}>Bénéfice principal</span>
                    <p className="m-0 mt-2 max-w-[34ch] font-display text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] font-bold leading-[1.12] text-balance">
                      {solution.mainBenefit}
                    </p>
                  </div>
                  {open && stampLabel && (
                    <span aria-hidden className={cn(styles.press, "stamp mr-1 mt-1 shrink-0")}>
                      {stampLabel}
                    </span>
                  )}
                </div>
                <p className="m-0 max-w-[58ch] text-[0.9375rem] leading-snug text-ink-soft">
                  {solution.shortDescription}
                </p>
                {modules.length > 0 && (
                  <div>
                    <span className={cn(styles.field, "t-field block")}>Modules clés</span>
                    <Stations stations={modules} label="Modules clés du produit" className="mt-2" />
                  </div>
                )}
              </div>

              {/* The detachable stub: the one red action, only on the open coupon */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-dashed border-ink pt-5">
                <CTAButton
                  intent="demo"
                  label="Demander une démo"
                  solutionSlug={slug}
                  block="solution-card"
                  size="md"
                />
                {solution.externalUrl && (
                  <a
                    href={solution.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 border-2 border-ink px-4 text-[0.9375rem] font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-white motion-reduce:transition-none"
                  >
                    Site du produit
                    <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                    <span className="sr-only"> (ouvre le site de {solution.name} dans un nouvel onglet)</span>
                  </a>
                )}
              </div>
            </div>

            {Preview && (
              <div className="min-h-[30rem] sm:min-h-[27rem]">
                {mounted ? <Preview name={solution.name} /> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
