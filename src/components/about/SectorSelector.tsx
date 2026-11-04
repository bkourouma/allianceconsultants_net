"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { LINES, getLine, lineStyle, type LineId } from "@/lib/network";
import { cn } from "@/lib/utils";

interface ServiceRef {
  label: string;
  slug: string;
}

const SERVICES: Record<string, ServiceRef> = {
  dematerialisation: {
    label: "Dématérialisation",
    slug: "dematerialisation-archives",
  },
  amoa: { label: "AMOA", slug: "assistance-maitrise-ouvrage" },
  automatisation: {
    label: "Automatisation IA",
    slug: "automatisation-ia-processus-metiers",
  },
  specifique: {
    label: "Développement spécifique",
    slug: "developpement-specifique",
  },
};

interface Sector {
  id: string;
  label: string;
  lines: LineId[];
  services: ServiceRef[];
}

const SECTORS: Sector[] = [
  {
    id: "administrations",
    label: "Administrations publiques et collectivités",
    lines: ["docupro"],
    services: [SERVICES.dematerialisation, SERVICES.amoa],
  },
  {
    id: "sante",
    label: "Cliniques, centres de santé et cabinets médicaux",
    lines: ["cliniquepro", "docupro"],
    services: [],
  },
  {
    id: "pharma",
    label: "Laboratoires et opérateurs pharmaceutiques",
    lines: ["medicpro", "docupro"],
    services: [],
  },
  {
    id: "finance",
    label: "Banques, assurances et institutions financières",
    lines: ["docupro"],
    services: [SERVICES.dematerialisation, SERVICES.automatisation],
  },
  {
    id: "immobilier",
    label: "Acteurs de l'immobilier et de la promotion",
    lines: ["immotopia", "annonces"],
    services: [],
  },
  {
    id: "entreprises",
    label: "ETI, PME et groupes industriels",
    lines: ["docupro"],
    services: [SERVICES.automatisation, SERVICES.specifique],
  },
  {
    id: "conseil",
    label: "Cabinets de conseil et organisations internationales",
    lines: ["docupro"],
    services: [SERVICES.amoa, SERVICES.specifique],
  },
];

/**
 * « Nous travaillons avec… » — choosing a sector lights up the product chips
 * that serve it and leaves the others dashed and quiet. Tabs semantics,
 * arrow-key navigation, readable without any animation.
 */
export function SectorSelector() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sector = SECTORS[active];
  const matched = sector.lines
    .map((id) => getLine(id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const primary = matched[0];

  function focusTab(i: number) {
    const next = (i + SECTORS.length) % SECTORS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        focusTab(i + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        focusTab(i - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(SECTORS.length - 1);
        break;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-12">
      {/* Secteurs : colonne de lignes sur un coupon */}
      <div
        role="tablist"
        aria-label="Secteurs d'activité"
        aria-orientation="vertical"
        className="coupon self-start overflow-hidden"
      >
        {SECTORS.map((s, i) => {
          const selected = i === active;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`sector-tab-${s.id}`}
              aria-selected={selected}
              aria-controls="sector-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative flex min-h-12 w-full items-center gap-3 border-b border-dashed border-ink-mute/50 px-4 py-2.5 text-left text-[0.9688rem] font-semibold leading-snug transition-colors duration-200 ease-[var(--ease-out-expo)] last:border-b-0",
                selected ? "bg-ink text-white" : "text-ink hover:bg-enamel",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-2.5 shrink-0 rounded-[2px] transition-colors duration-200",
                  selected ? "bg-red" : "border-2 border-ink-mute bg-panel",
                )}
              />
              <span className="text-balance">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Produits à bord */}
      <div
        role="tabpanel"
        id="sector-panel"
        aria-labelledby={`sector-tab-${sector.id}`}
        tabIndex={0}
        className="coupon self-start overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 bg-ink px-5 py-2.5 text-white sm:px-7">
          <p className="t-field !text-white">Produits pour ce secteur</p>
          <p className="t-field t-num !text-white/80">
            {matched.length} sur {LINES.length}
          </p>
        </div>

        <div key={sector.id} className="animate-fade-up p-5 sm:p-7">
          <p className="font-display text-xl font-bold leading-tight text-ink">
            {sector.label}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2.5">
            {LINES.map((l) => {
              const lit = sector.lines.includes(l.id);
              return (
                <li key={l.id} style={lineStyle(l.id)}>
                  <span
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 px-3.5 font-display text-[1.0625rem] font-bold leading-none transition-[transform,background-color,box-shadow,color] duration-300 ease-[var(--ease-out-expo)]",
                      lit
                        ? "-translate-y-0.5 border-ink bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)]"
                        : "border-dashed border-ink-mute bg-transparent text-ink-mute",
                    )}
                  >
                    {lit ? (
                      <Check aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
                    ) : null}
                    {l.name}
                    {!lit ? (
                      <span className="sr-only"> (non concerné par ce secteur)</span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="tear mt-6" aria-hidden />

          <ul className="mt-5 grid gap-2.5">
            {matched.map((l) => (
              <li key={l.id} style={lineStyle(l.id)}>
                <Link
                  href={`/solutions/${l.slug}`}
                  className="group flex items-center gap-4 rounded-[3px] border-2 border-ink bg-panel py-3 pl-3 pr-4 shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)]"
                >
                  <span
                    aria-hidden
                    className="h-9 w-2 shrink-0 rounded-[2px] bg-[var(--accent)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl font-bold leading-tight text-ink">
                      {l.name}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink-soft">
                      {l.pitch}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 text-ink transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {sector.services.length > 0 ? (
            <div className="mt-6">
              <p className="t-field">Services associés</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {sector.services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="inline-flex min-h-11 items-center rounded-[3px] border border-ink-mute bg-panel px-4 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-white"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {primary ? (
            <div className="mt-7" style={lineStyle(primary.id)}>
              <CTAButton
                intent="demo"
                label={`Demander une démo ${primary.name}`}
                solutionSlug={primary.slug}
                block="solution-card"
                from="a-propos"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
