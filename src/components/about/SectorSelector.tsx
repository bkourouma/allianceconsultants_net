"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
 * « Nous travaillons avec… » — an interactive sector selector. Choosing a
 * sector lights up the product lines that serve it and dims the rest.
 * Tabs semantics, arrow-key navigation, readable without JS-driven motion.
 */
export function SectorSelector() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sector = SECTORS[active];
  const matched = sector.lines
    .map((id) => getLine(id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const others = LINES.filter((l) => !sector.lines.includes(l.id));
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
      <div
        role="tablist"
        aria-label="Secteurs d'activité"
        aria-orientation="vertical"
        className="relative flex flex-col"
      >
        <span
          aria-hidden
          className="absolute bottom-6 left-[0.9375rem] top-6 w-1 rounded-full bg-rule"
        />
        {SECTORS.map((s, i) => {
          const selected = i === active;
          const accent = getLine(s.lines[0]);
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
                "relative flex min-h-12 items-center gap-4 rounded-full py-2 pl-2 pr-4 text-left text-[0.9375rem] font-semibold leading-snug transition-colors duration-300 ease-[var(--ease-out-expo)]",
                selected ? "bg-ink text-white" : "text-ink hover:bg-panel",
              )}
            >
              <span
                aria-hidden
                className="relative z-10 grid size-5 shrink-0 place-items-center"
              >
                <span
                  className={cn(
                    "block rounded-full border-[3px] bg-panel transition-all duration-300 ease-[var(--ease-out-expo)]",
                    selected ? "size-5" : "size-4",
                  )}
                  style={{ borderColor: accent?.color ?? "var(--color-ink)" }}
                />
              </span>
              <span className="text-balance">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="sector-panel"
        aria-labelledby={`sector-tab-${sector.id}`}
        tabIndex={0}
        className="rounded-lg bg-panel p-5 ring-1 ring-rule sm:p-7"
      >
        <div key={sector.id} className="animate-fade-up">
          <p className="t-station text-ink-mute">
            Lignes à bord pour ce secteur
          </p>
          <ul className="mt-4 grid gap-3">
            {matched.map((l) => (
              <li key={l.id} style={lineStyle(l.id)}>
                <Link
                  href={`/solutions/${l.slug}`}
                  className="group flex items-center gap-4 rounded-lg bg-[var(--accent)] p-4 text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-white font-display text-lg font-extrabold text-ink"
                  >
                    {l.glyph}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold leading-tight">
                      {l.name}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug">
                      {l.pitch}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {sector.services.length > 0 ? (
            <div className="mt-5">
              <p className="t-station text-ink-mute">
                Correspondances (services)
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {sector.services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-enamel py-1.5 pl-3 pr-4 text-sm font-semibold text-ink ring-1 ring-ink-mute/40 transition-colors hover:bg-ink hover:text-white"
                    >
                      <span
                        aria-hidden
                        className="size-3.5 rounded-full border-[3px] border-ink bg-panel"
                      />
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div
            aria-hidden
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-5"
          >
            <span className="t-station text-ink-mute">Autres lignes</span>
            {others.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft"
              >
                <span
                  className="size-3 rounded-full"
                  style={{ background: l.color }}
                />
                {l.name}
              </span>
            ))}
          </div>

          {primary ? (
            <div className="mt-6" style={lineStyle(primary.id)}>
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
