"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LINES } from "@/lib/network";
import { ACADEMIE } from "./data";
import type { RouteDef } from "./data";
import { BoardBody, routeStyle } from "./Planner";

/** Desktop station-board: line-coloured header band + white body. */
export function BoardPanel({
  route,
  onClose,
  block,
  compact,
  className,
}: {
  route: RouteDef | undefined;
  onClose: () => void;
  block?: string;
  /** Phones: no module list (the map carries it). */
  compact?: boolean;
  className?: string;
}) {
  if (!route) {
    return (
      <div className={cn("flex flex-col justify-between rounded-[8px] border border-rule bg-panel p-5", className)}>
        <ConvergingLines />
        <div>
        <p className="font-display text-[1.5rem] leading-[1.08] font-bold tracking-tight text-balance text-ink">
          Votre besoin a sa ligne.
        </p>
        <p className="mt-3 text-[0.9375rem] leading-[1.5] text-ink-soft">
          Choisissez ce que vous cherchez dans la barre ci-dessus : la ligne s&rsquo;illumine jusqu&rsquo;au terminus,
          avec ses modules et la démonstration qui va avec.
        </p>
        <p className="mt-3 text-[0.8125rem] leading-[1.45] text-ink-mute">
          Survolez ou touchez une station pour en voir le détail.
        </p>
        </div>
      </div>
    );
  }
  return (
    <div
      style={routeStyle(route)}
      className={cn("overflow-hidden rounded-[8px] border border-rule bg-panel", className)}
    >
      <div className="flex items-start justify-between gap-3 bg-[var(--accent)] px-4 py-3 text-[var(--on-accent)]">
        <div className="min-w-0">
          <p className="font-display text-[1.25rem] leading-tight font-bold tracking-tight">{route.name}</p>
          <p className="mt-0.5 text-[0.8125rem] leading-tight font-semibold opacity-90">{route.sector}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Revenir au réseau complet"
          className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-current/70 transition-colors hover:bg-[var(--on-accent)] hover:text-[var(--accent)] focus-visible:outline-ink!"
        >
          <X className="size-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      <BoardBody route={route} block={block} bare compact={compact} />
    </div>
  );
}

/** Six lines converging on one terminus: the whole idea, in 240 px. */
function ConvergingLines() {
  const ys = [8, 22, 36, 52, 66, 80];
  return (
    <svg viewBox="0 0 250 88" className="h-auto w-full max-w-[15.5rem]" aria-hidden>
      {LINES.map((l, i) => {
        const y = ys[i];
        const bx = 206 - Math.abs(44 - y);
        return (
          <path
            key={l.id}
            d={`M6 ${y}H${bx}L206 44`}
            fill="none"
            stroke={l.color}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      <circle cx="224" cy="44" r="15" fill="#0b1b3a" />
      <path d="M217 44h14M226.5 38.5l5.5 5.5-5.5 5.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────── legend ───────────── */

function LegendIcon({ kind }: { kind: "station" | "interchange" | "academie" | "terminus" }) {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-8 shrink-0" aria-hidden>
      {kind === "station" && (
        <>
          <rect x="0" y="7" width="32" height="6" rx="3" fill="#1457f5" />
          <circle cx="16" cy="10" r="6" fill="#fff" stroke="#0b1b3a" strokeWidth="2.6" />
        </>
      )}
      {kind === "interchange" && (
        <>
          <rect x="0" y="3.5" width="32" height="5" rx="2.5" fill="#098240" />
          <rect x="0" y="11.5" width="32" height="5" rx="2.5" fill="#1457f5" />
          <rect x="11" y="1" width="10" height="18" rx="5" fill="#fff" stroke="#0b1b3a" strokeWidth="2.6" />
        </>
      )}
      {kind === "academie" && (
        <ellipse cx="16" cy="10" rx="12.5" ry="7" fill="none" stroke={ACADEMIE.color} strokeWidth="5" />
      )}
      {kind === "terminus" && (
        <>
          <rect x="0" y="7" width="14" height="6" rx="3" fill="#e0245e" />
          <circle cx="21" cy="10" r="9" fill="#0b1b3a" />
          <path d="M17 10h8M22.5 7l3 3-3 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

const LEGEND = [
  { kind: "station", term: "Station", text: "un module du logiciel" },
  { kind: "interchange", term: "Correspondance", text: "un service Alliance" },
  { kind: "academie", term: "Ligne violette", text: "nos formations" },
  { kind: "terminus", term: "Terminus", text: "votre démo" },
] as const;

export function Legend({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="font-display text-[1.0625rem] leading-tight font-bold tracking-tight text-ink">Lire le plan</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1 md:gap-y-2.5 min-[1180px]:gap-y-2">
        {LEGEND.map((l) => (
          <div key={l.kind} className="flex items-center gap-2.5">
            <LegendIcon kind={l.kind} />
            <div className="text-[0.8125rem] leading-tight text-ink-soft">
              <dt className="inline font-bold text-ink">{l.term}</dt>
              <dd className="ml-1 inline">: {l.text}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
