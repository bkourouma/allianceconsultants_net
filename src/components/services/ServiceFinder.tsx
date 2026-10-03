"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLine } from "@/lib/network";
import { LineRoundel } from "./LineRoundel";
import { NEEDS, SERVICE_META } from "./serviceMap";

export interface FinderService {
  slug: string;
  title: string;
  shortDescription: string;
}

/**
 * "Quel besoin ?" selector + the services drawn as interchange stations on
 * one long ink line. Picking a need highlights matching services and dims
 * the others (nothing is removed from the DOM or the tab order).
 */
export function ServiceFinder({ services }: { services: FinderService[] }) {
  const [need, setNeed] = useState<string | null>(null);
  const active = NEEDS.find((n) => n.id === need);
  const match = (slug: string) => !active || active.slugs.includes(slug);
  const count = services.filter((s) => match(s.slug)).length;

  return (
    <div>
      <div className="rounded-lg bg-panel p-5 ring-1 ring-rule sm:p-7">
        <h2 id="need-title" className="t-h3 text-ink">
          Quel besoin ?
        </h2>
        <p className="mt-2 max-w-[60ch] text-ink-soft">
          Choisissez ce qui vous ressemble : les services concernés s&apos;allument sur la ligne.
        </p>
        <div
          role="group"
          aria-labelledby="need-title"
          className="mt-5 flex flex-wrap gap-2.5"
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
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out-expo)]",
                  on
                    ? "bg-ink text-white ring-2 ring-ink"
                    : "bg-enamel text-ink ring-2 ring-inset ring-rule hover:ring-ink",
                )}
              >
                {on && <Check aria-hidden className="size-4" strokeWidth={2} />}
                {n.label}
              </button>
            );
          })}
          {active && (
            <button
              type="button"
              onClick={() => setNeed(null)}
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Tout afficher
            </button>
          )}
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm font-semibold text-ink-soft">
          {active
            ? `${count} service${count > 1 ? "s" : ""} pour « ${active.label} »`
            : ""}
        </p>
      </div>

      <ol className="mt-10 sm:mt-14">
        {services.map((s, i) => {
          const meta = SERVICE_META[s.slug];
          const lines = meta?.lines ?? [];
          const hit = match(s.slug);
          const highlighted = !!active && hit;
          const first = i === 0;
          const last = i === services.length - 1;
          return (
            <li key={s.slug} className="relative pb-5 pl-12 last:pb-0 md:pb-7 md:pl-24">
              {/* ink line segment */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] w-1.5 bg-ink md:left-[40px] md:w-2",
                  first ? "top-[44px] bottom-0" : last ? "top-0 h-[44px]" : "inset-y-0",
                )}
              />
              {/* interchange station */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-7 md:top-6 size-8 rounded-full border-[6px] border-ink ring-4 ring-enamel transition-colors duration-300 md:left-6 md:size-10 md:border-[7px]",
                  highlighted ? "bg-[var(--accent)]" : "bg-panel",
                )}
              />
              <article
                className={cn(
                  "grid gap-6 rounded-lg bg-panel p-6 ring-1 transition-[opacity,box-shadow] duration-300 ease-[var(--ease-out-expo)] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-10 md:p-8",
                  highlighted
                    ? "ring-2 ring-ink shadow-[0_14px_32px_-18px_rgba(11,27,58,0.45)]"
                    : "ring-rule",
                  !hit && "opacity-50",
                )}
              >
                <div>
                  <h3 className="t-h3 text-ink">{s.title}</h3>
                  <p className="t-body mt-3 text-ink-soft">{s.shortDescription}</p>
                  {highlighted && (
                    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-sm font-semibold text-white">
                      <Check aria-hidden className="size-4" strokeWidth={2} />
                      Correspond à votre besoin
                    </p>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-6">
                  {lines.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-ink-mute">Se connecte à</p>
                      <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-3" aria-label="Solutions connectées">
                        {lines.map((id) => (
                          <li key={id}>
                            <LineRoundel line={id} size="sm" />
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-ink-soft">
                        {meta?.transversal
                          ? "Toutes les solutions"
                          : lines.map((id) => getLine(id)?.name).join(" · ")}
                      </p>
                    </div>
                  )}
                  <Link
                    href={`/services/${s.slug}`}
                    className="group/link inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-ink pl-5 pr-1.5 font-bold text-white transition-colors hover:bg-night-2"
                  >
                    Découvrir le service
                    <span className="sr-only"> {s.title}</span>
                    <span
                      aria-hidden
                      className="grid size-8 place-items-center rounded-full bg-white text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:translate-x-0.5 motion-reduce:transition-none"
                    >
                      <ArrowRight className="size-4" strokeWidth={2} />
                    </span>
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
