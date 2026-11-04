"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CouponHead } from "./CouponHead";
import { ProductChips } from "./ProductChips";
import { NEEDS, SERVICE_META } from "./serviceMap";
import fx from "./fx.module.css";

export interface FinderService {
  slug: string;
  title: string;
  shortDescription: string;
}

/**
 * "Quel besoin ?" selector + the services as bons de travail (work-order
 * coupons). Picking a need lifts the matching coupon and presses a stamp on
 * it; the others recede (nothing leaves the DOM or the tab order).
 */
export function ServiceFinder({ services }: { services: FinderService[] }) {
  const [need, setNeed] = useState<string | null>(null);
  const active = NEEDS.find((n) => n.id === need);
  const match = (slug: string) => !active || active.slugs.includes(slug);
  const count = services.filter((s) => match(s.slug)).length;

  return (
    <div>
      <div className="border-y-2 border-ink py-6 md:py-7">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-12">
          <div>
            <h2 id="need-title" className="t-h3 text-ink">
              Quel besoin ?
            </h2>
            <p className="mt-1.5 max-w-[34ch] text-ink-soft">
              Choisissez ce qui vous ressemble : le bon de travail concerné se
              détache.
            </p>
          </div>
          <div>
            <div
              role="group"
              aria-labelledby="need-title"
              className="flex flex-wrap gap-2.5"
            >
              {NEEDS.map((n) => {
                const on = n.id === need;
                return (
                  <button
                    key={n.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setNeed(on ? null : n.id)}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 border-ink px-4 font-display text-[1.0625rem] font-bold uppercase tracking-[0.05em] transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-expo)] active:translate-y-px",
                      on
                        ? "bg-ink text-white"
                        : "bg-panel text-ink hover:bg-ink hover:text-white",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-[2px] border-2",
                        on
                          ? "border-red bg-red text-white"
                          : "border-ink bg-transparent text-transparent",
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {n.label}
                  </button>
                );
              })}
              {active && (
                <button
                  type="button"
                  onClick={() => setNeed(null)}
                  className="inline-flex min-h-11 items-center px-3 font-display text-[1.0625rem] font-bold uppercase tracking-[0.05em] text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  Tout afficher
                </button>
              )}
            </div>
            <p
              role="status"
              aria-live="polite"
              className="mt-3 min-h-5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink-mute"
            >
              {active
                ? `${count} service${count > 1 ? "s" : ""} pour « ${active.label} »`
                : ""}
            </p>
          </div>
        </div>
      </div>

      <ol className="mt-10 grid gap-7 md:mt-14 md:gap-9">
        {services.map((s, i) => {
          const meta = SERVICE_META[s.slug];
          const hit = match(s.slug);
          const highlighted = !!active && hit;
          const no = String(i + 1);
          const numeral = String(i + 1).padStart(2, "0");
          return (
            <li key={s.slug}>
              <article
                className={cn(
                  "coupon relative grid transition-[transform,box-shadow,opacity] duration-300 ease-[var(--ease-out-expo)] md:grid-cols-[minmax(0,1fr)_15rem]",
                  highlighted
                    ? "-translate-y-1.5 shadow-[0_16px_20px_-12px_rgba(15,42,90,0.42)]"
                    : "hover:-translate-y-0.5",
                  !hit && "opacity-70",
                )}
              >
                {highlighted && (
                  <span
                    key={need}
                    aria-hidden
                    className={cn(
                      "stamp pointer-events-none absolute -top-4 right-5 z-10 bg-white md:right-[16.5rem]",
                      fx.stampPress,
                    )}
                  >
                    Votre besoin
                  </span>
                )}
                <CouponHead
                  no={no}
                  label="Bon de travail"
                  className="md:col-span-2"
                />
                <div className="min-w-0 px-5 py-6 md:px-8 md:py-8">
                  <h3 className="font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-bold leading-[1.02] text-ink">
                    {s.title}
                  </h3>
                  <p className="t-body mt-3 text-lg leading-relaxed text-ink-soft">
                    {s.shortDescription}
                  </p>
                  {meta && meta.lines.length > 0 && (
                    <div className="mt-6 border-t border-rule pt-4">
                      <p className="t-field">
                        {meta.transversal
                          ? "S'applique à toutes nos solutions"
                          : "Se connecte à"}
                      </p>
                      <ProductChips
                        ids={meta.lines}
                        className="mt-2.5"
                        label={`Solutions liées à ${s.title}`}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between gap-5 border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-5 md:flex-col md:items-stretch md:justify-between md:border-l-2 md:border-t-0 md:px-6 md:py-6">
                  <div>
                    <p className="t-field text-carbon!">Coupon détachable</p>
                    <p
                      aria-hidden
                      className="carbon mt-1 font-display text-[3.5rem] font-extrabold leading-[0.9] md:text-[4.25rem]"
                    >
                      {numeral}
                    </p>
                  </div>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group/link inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] bg-ink px-4 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-white transition-colors duration-200 hover:bg-night-2 after:absolute after:inset-0 after:content-['']"
                  >
                    Découvrir
                    <span className="sr-only"> le service {s.title}</span>
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
      </ol>
    </div>
  );
}
