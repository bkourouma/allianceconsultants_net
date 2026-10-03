"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
import { StationStrip } from "./StationStrip";
import { glyphForName } from "@/components/services/serviceMap";
import s from "./Solutions.module.css";

export interface LineEntry {
  slug: string;
  name: string;
  /** Short sector label from the network model ("Archives & GED"). */
  sector: string;
  category: string;
  mainBenefit: string;
  shortDescription: string;
  /** Feature-group titles, i.e. the stations. */
  stations: string[];
  /** targetAudience labels from the MDX. */
  audience: string[];
  externalUrl?: string | null;
}

interface SolutionsFinderProps {
  lines: LineEntry[];
}

export function SolutionsFinder({ lines }: SolutionsFinderProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const ordered = useMemo(() => {
    if (!selected) return lines;
    const first = lines.find((l) => l.slug === selected);
    return first ? [first, ...lines.filter((l) => l.slug !== selected)] : lines;
  }, [lines, selected]);

  // FLIP: glide bands to their new position when the order changes.
  const listRef = useRef<HTMLOListElement>(null);
  const prevTops = useRef<Map<string, number>>(new Map());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    list.querySelectorAll<HTMLElement>("[data-line]").forEach((el) => {
      const slug = el.dataset.line as string;
      const top = el.offsetTop;
      next.set(slug, top);
      const old = prevTops.current.get(slug);
      if (!reduce && old !== undefined && old !== top && el.animate) {
        el.animate(
          [{ transform: `translateY(${old - top}px)` }, { transform: "none" }],
          { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        );
      }
    });
    prevTops.current = next;
  }, [selected]);

  const selectedLine = lines.find((l) => l.slug === selected);

  return (
    <>
      {/* Finder */}
      <section
        aria-labelledby="finder-title"
        className={cn("bg-enamel pb-10", s.focusInk)}
      >
        <div className="wrap">
          <div className="rounded-md bg-panel p-6 sm:p-8">
            <h2 id="finder-title" className="t-h3 text-ink">
              Quel est votre métier&nbsp;?
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {lines.map((l) => {
                const on = selected === l.slug;
                return (
                  <li key={l.slug} style={lineStyle(l.slug)}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSelected(on ? null : l.slug)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-[0.9375rem] font-bold transition-colors duration-300",
                        on
                          ? "bg-ink text-white"
                          : "bg-enamel text-ink ring-2 ring-inset ring-ink/20 hover:ring-ink",
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-6 shrink-0 rounded-full bg-[var(--accent)] ring-2 ring-white"
                      />
                      {l.sector}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm text-ink-soft">
              {selectedLine
                ? `Ligne ${selectedLine.name} mise en avant. Les autres lignes sont atténuées.`
                : "Choisissez un métier : sa ligne passe en tête de réseau."}
            </p>
          </div>
        </div>
      </section>

      {/* Lineup */}
      <section
        aria-label="Les lignes du réseau"
        className={cn("bg-enamel pb-16 lg:pb-24", s.focusOnAccent)}
      >
        <div className="wrap">
          <ol ref={listRef} className="relative">
            {ordered.map((l) => {
              const dim = selected !== null && l.slug !== selected;
              const stations = l.stations.slice(0, 4);
              return (
                <li
                  key={l.slug}
                  data-line={l.slug}
                  style={lineStyle(l.slug)}
                  className={cn(
                    "relative mb-6 rounded-md bg-[var(--accent)] p-6 text-[var(--on-accent)] transition-[opacity,filter] duration-500 ease-[var(--ease-out-expo)] last:mb-0 sm:p-8 lg:p-10",
                    "after:absolute after:left-[53px] after:top-full after:h-6 after:w-1.5 after:bg-ink sm:after:left-[61px] lg:after:left-[77px] last:after:hidden",
                    dim &&
                      "opacity-50 saturate-50 hover:opacity-100 hover:saturate-100 focus-within:opacity-100 focus-within:saturate-100",
                  )}
                >
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
                    <div>
                      <div className="flex items-center gap-4 lg:gap-5">
                        <span
                          aria-hidden
                          className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--on-accent)] font-display text-3xl font-extrabold text-[var(--accent)] lg:size-20 lg:text-4xl"
                        >
                          {glyphForName(l.name)}
                        </span>
                        <h2 className="text-balance font-display text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] font-extrabold leading-[1] tracking-[-0.03em]">
                          <Link
                            href={`/solutions/${l.slug}`}
                            className="no-underline"
                          >
                            {l.name}
                          </Link>
                        </h2>
                      </div>
                      <p className="mt-5 inline-flex rounded-full bg-[var(--on-accent)] px-3 py-1 text-sm font-bold text-[var(--accent)]">
                        {l.sector}
                      </p>
                      <p className="mt-4 max-w-[46ch] text-pretty text-lg leading-snug">
                        {l.mainBenefit}
                      </p>
                      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <CTAButton
                          intent="demo"
                          label="Demander une démo"
                          solutionSlug={l.slug}
                          block="solution-card"
                          from="solutions-index"
                          onDark
                        />
                        <Link
                          href={`/solutions/${l.slug}`}
                          className="inline-flex min-h-11 items-center gap-2 text-base font-bold underline decoration-current/50 underline-offset-4 hover:decoration-current"
                        >
                          Voir la ligne
                          <span className="sr-only"> {l.name}</span>
                          <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                        </Link>
                        {l.externalUrl && (
                          <a
                            href={l.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 text-base font-bold underline decoration-current/50 underline-offset-4 hover:decoration-current"
                          >
                            Ouvrir le produit
                            <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                            <span className="sr-only"> {l.name} (nouvel onglet)</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div aria-hidden className="lg:self-center">
                      <StationStrip labels={stations} tone="field" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Compare strip: who each line is for */}
      <section
        aria-labelledby="compare-title"
        className={cn("bg-night pb-16 pt-14 text-white lg:pb-24 lg:pt-20", s.focusNight)}
      >
        <div className="wrap">
          <h2 id="compare-title" className="t-h2 max-w-[18ch]">
            Pour qui, quelle ligne&nbsp;?
          </h2>
          <ul className="mt-10 border-t-2 border-white/40">
            {lines.map((l) => {
              const dim = selected !== null && l.slug !== selected;
              return (
                <li
                  key={l.slug}
                  style={lineStyle(l.slug)}
                  className={cn(
                    "grid gap-x-8 gap-y-3 border-b border-white/20 py-5 transition-opacity duration-500 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:items-center",
                    dim && "opacity-45",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] font-display text-base font-extrabold text-[var(--on-accent)]"
                    >
                      {glyphForName(l.name)}
                    </span>
                    <Link
                      href={`/solutions/${l.slug}`}
                      className="font-display text-lg font-bold underline decoration-white/30 underline-offset-4 hover:decoration-white"
                    >
                      {l.name}
                    </Link>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {l.audience.map((a) => (
                      <li
                        key={a}
                        className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/40"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
