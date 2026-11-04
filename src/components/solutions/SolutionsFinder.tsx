"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
import { couponNo, pad2 } from "./couponMeta";
import s from "./Solutions.module.css";

export interface LineEntry {
  slug: string;
  name: string;
  /** Short sector label from the network model ("Archives & GED"). */
  sector: string;
  category: string;
  mainBenefit: string;
  shortDescription: string;
  /** Feature-group titles. */
  areas: string[];
  /** targetAudience labels from the MDX. */
  audience: string[];
  externalUrl?: string | null;
}

interface SolutionsFinderProps {
  lines: LineEntry[];
}

const LIFTED_SHADOW =
  "0 22px 28px -14px rgba(15, 42, 90, 0.4)";

/**
 * « Quel est votre métier ? » finder, the six coupons as a strict list and the
 * closing audience strip. Picking a métier lifts its coupon to the top of the
 * wallet (FLIP glide) and dims the others.
 */
export function SolutionsFinder({ lines }: SolutionsFinderProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const ordered = useMemo(() => {
    if (!selected) return lines;
    const first = lines.find((l) => l.slug === selected);
    return first ? [first, ...lines.filter((l) => l.slug !== selected)] : lines;
  }, [lines, selected]);

  // FLIP: glide coupons to their new position when the order changes.
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
    <div className={s.focusInk}>
      {/* Finder */}
      <section aria-labelledby="finder-title" className="pb-10 lg:pb-14">
        <div className="wrap">
          <hr className="tear" />
          <div className="mt-8 grid gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-start">
            <h2 id="finder-title" className="t-h3 text-ink">
              Quel est votre métier&nbsp;?
            </h2>
            <div>
              <ul className="flex flex-wrap gap-2.5">
                {lines.map((l) => {
                  const on = selected === l.slug;
                  return (
                    <li key={l.slug} style={lineStyle(l.slug)}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSelected(on ? null : l.slug)}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2.5 rounded-[3px] border-2 border-ink px-3.5 py-1.5 font-display text-[1.0625rem] font-bold uppercase leading-tight tracking-[0.05em] transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)]",
                          on
                            ? "bg-ink text-white"
                            : "bg-panel text-ink hover:-translate-y-0.5",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-3.5 shrink-0 rounded-[2px] bg-[var(--accent)]",
                            on ? "ring-2 ring-white" : "ring-1 ring-ink",
                          )}
                        />
                        {l.sector}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p
                role="status"
                aria-live="polite"
                className="mt-4 min-h-6 text-sm text-ink-soft"
              >
                {selectedLine
                  ? `Coupon ${selectedLine.name} mis en avant. Les autres sont atténués.`
                  : "Choisissez un métier : son coupon passe en tête du carnet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The six coupons: a strict list */}
      <section aria-label="Les six coupons" className="pb-16 lg:pb-24">
        <div className="wrap">
          <ol ref={listRef} className="grid gap-8 lg:gap-10">
            {ordered.map((l) => {
              const on = selected === l.slug;
              const dim = selected !== null && !on;
              const no = couponNo(l.slug);
              const groups = l.areas.slice(0, 4);
              return (
                <li
                  key={l.slug}
                  data-line={l.slug}
                  style={{
                    ...lineStyle(l.slug),
                    ...(on
                      ? { boxShadow: LIFTED_SHADOW, transform: "translateY(-4px)" }
                      : {}),
                  }}
                  className={cn(
                    "coupon transition-[opacity,filter,box-shadow,transform] duration-500 ease-[var(--ease-out-expo)]",
                    dim &&
                      "opacity-50 saturate-50 hover:opacity-100 hover:saturate-100 focus-within:opacity-100 focus-within:saturate-100",
                  )}
                >
                  <div className="grid lg:grid-cols-[6.5rem_minmax(0,1fr)_19rem]">
                    {/* Numeral cell */}
                    <div className="relative flex items-center gap-3 border-b-2 border-ink px-5 py-3 lg:flex-col lg:items-center lg:justify-start lg:gap-1 lg:border-b-0 lg:border-r-2 lg:px-2 lg:py-8">
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-1.5 bg-ink lg:rounded-l-[2px]"
                      />
                      <span className="t-field pl-2 lg:pl-0">Coupon</span>
                      <span
                        aria-hidden
                        className="carbon t-num font-display text-5xl font-extrabold leading-[0.9] lg:text-6xl"
                      >
                        {pad2(no)}
                      </span>
                    </div>

                    {/* Main */}
                    <div className="p-6 sm:p-8 lg:p-10">
                      <h2 className="font-display text-[clamp(2.125rem,1.5rem+2.4vw,3.5rem)] font-extrabold italic leading-[0.98] tracking-[-0.012em] text-ink">
                        <Link
                          href={`/solutions/${l.slug}`}
                          className="no-underline"
                        >
                          {l.name}
                        </Link>
                      </h2>
                      <p className="mt-3 inline-flex rounded-[3px] bg-[var(--accent)] px-2.5 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--on-accent)]">
                        {l.sector}
                      </p>
                      <p className="t-lead mt-5 !max-w-[52ch] !text-ink">
                        {l.mainBenefit}
                      </p>
                      {groups.length > 0 && (
                        <ul className="mt-6 flex flex-wrap gap-2">
                          {groups.map((g) => (
                            <li
                              key={g}
                              className="rounded-[3px] border border-ink bg-white px-2.5 py-1 text-[0.8125rem] font-semibold leading-snug text-ink"
                            >
                              {g}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Detachable stub */}
                    <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 lg:rounded-br-[2px] lg:border-l-2 lg:border-t-0">
                      <div className="flex min-h-9 items-center">
                        {on ? (
                          <p key="stamp" className={cn("stamp", s.stampPress)}>
                            Votre métier
                          </p>
                        ) : (
                          <p className="t-field !text-carbon">
                            Coupon détachable
                          </p>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <CTAButton
                          intent="demo"
                          label="Demander une démo"
                          solutionSlug={l.slug}
                          block="solution-card"
                          from="solutions-index"
                          className="h-auto min-h-12 w-full px-4 py-2 text-center leading-tight"
                        />
                        <Link
                          href={`/solutions/${l.slug}`}
                          className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                        >
                          Voir la solution
                          <span className="sr-only"> {l.name}</span>
                          <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                        </Link>
                        {l.externalUrl && (
                          <a
                            href={l.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                          >
                            Ouvrir le produit
                            <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                            <span className="sr-only"> {l.name} (nouvel onglet)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Audience strip: who each coupon is for */}
      <section aria-labelledby="compare-title" className="pb-16 lg:pb-24">
        <div className="wrap">
          <h2 id="compare-title" className="t-h2 max-w-[20ch] text-ink">
            Pour qui, quel coupon&nbsp;?
          </h2>
          <ul className="mt-10 border-t-2 border-ink">
            {lines.map((l) => {
              const dim = selected !== null && l.slug !== selected;
              return (
                <li
                  key={l.slug}
                  style={lineStyle(l.slug)}
                  className={cn(
                    "grid gap-x-8 gap-y-3 border-b border-rule py-5 transition-opacity duration-500 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:items-center",
                    dim && "opacity-45",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="size-3.5 shrink-0 rounded-[2px] bg-[var(--accent)] ring-1 ring-ink"
                    />
                    <Link
                      href={`/solutions/${l.slug}`}
                      className="font-display text-xl font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                    >
                      {l.name}
                    </Link>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {l.audience.map((a) => (
                      <li
                        key={a}
                        className="rounded-[3px] border border-ink bg-white px-2.5 py-1 text-[0.8125rem] font-semibold leading-snug text-ink"
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
    </div>
  );
}
