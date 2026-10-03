"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { VB_H, VB_W, getRoute } from "./data";
import { PW } from "./portrait";
import type { RouteId } from "./data";
import { BoardPanel, Legend } from "./Board";
import { NetworkDiagram } from "./NetworkDiagram";
import { PlannerPills } from "./Planner";
import { PORTRAIT, PortraitDiagram } from "./PortraitDiagram";
import { NODE_INFO } from "./nodes";
import { useInView, useMediaQuery, usePrefersReducedMotion } from "./hooks";
import styles from "./NetworkMap.module.css";

export interface NetworkMapProps {
  className?: string;
  /** Route shown on first render (uncontrolled). */
  defaultRoute?: RouteId | null;
  /** Controlled route; pair with `onRouteChange`. */
  route?: RouteId | null;
  onRouteChange?: (route: RouteId | null) => void;
  /** `block` query param forwarded to /contact-demo (tracking origin). */
  block?: string;
}

function Tooltip({
  id,
  at,
  box,
  below,
}: {
  id: string;
  at: { x: number; y: number };
  box: { w: number; h: number };
  below: boolean;
}) {
  const n = NODE_INFO[id];
  if (!n) return null;
  const left = (at.x / box.w) * 100;
  const top = (at.y / box.h) * 100;
  return (
    <div
      role="tooltip"
      aria-hidden="true"
      className={`${styles.tip} pointer-events-none absolute z-20 w-[16.5rem] max-w-[calc(100%-1rem)] rounded-[8px] border border-rule bg-panel p-3 text-left shadow-[0_10px_24px_-12px_rgba(7,18,43,0.35)]`}
      style={{
        left: `clamp(8.4rem, ${left}%, calc(100% - 8.4rem))`,
        top: `${top}%`,
        transform: `translate(-50%, ${below ? "22px" : "calc(-100% - 22px)"})`,
      }}
    >
      <p className="flex items-start gap-2 font-display text-[0.9375rem] leading-tight font-bold text-ink">
        <span aria-hidden className="mt-[3px] size-2.5 shrink-0 rounded-full" style={{ background: n.color }} />
        {n.title}
      </p>
      <ul className="mt-1.5 space-y-0.5 text-[0.8125rem] leading-snug text-ink-soft">
        {n.items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
      {n.note && <p className="mt-1.5 text-[0.8125rem] leading-snug font-semibold text-ink">{n.note}</p>}
    </div>
  );
}

/**
 * The signature interactive network map: journey planner + octilinear SVG
 * diagram + station board. Desktop (≥ 1180px): chips bar, board dock and map.
 * Phones / tablets: the same chips drive a portrait octilinear map; the board
 * opens under the chips (beside the map on tablets).
 */
export function NetworkMap({
  className,
  defaultRoute = null,
  route: controlledRoute,
  onRouteChange,
  block = "hero",
}: NetworkMapProps) {
  const [innerRoute, setInnerRoute] = useState<RouteId | null>(defaultRoute);
  const route = controlledRoute !== undefined ? controlledRoute : innerRoute;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery("(min-width: 1180px)");
  const inView = useInView(rootRef);
  const animate = !reduced && desktop;

  const setRoute = useCallback(
    (next: RouteId | null) => {
      setInnerRoute(next);
      setPinnedId(null);
      onRouteChange?.(next);
    },
    [onRouteChange],
  );

  /* Trains only run while the map is on screen. */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !animate) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView, animate, route]);

  const onSelectNode = useCallback(
    (nodeId: string) => {
      const info = NODE_INFO[nodeId];
      if (!info) return;
      if (info.route) {
        setInnerRoute(info.route);
        onRouteChange?.(info.route);
      }
      setPinnedId(nodeId);
    },
    [onRouteChange],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape" && (route || pinnedId)) {
      setRoute(null);
    }
  };

  const active = getRoute(route);
  const tipId = hoverId ?? pinnedId;
  const summary = active
    ? `${active.name}, ${active.sector}. ${active.pitch} ${active.modulesTitle} : ${active.modules.map((m) => m.name).join(", ")}.`
    : "Réseau complet affiché.";

  /* A tap on the empty map (not on a station) closes the pinned detail. */
  const clearPin = (e: MouseEvent<HTMLElement>) => {
    if (!(e.target as Element).closest("[data-node],a")) setPinnedId(null);
  };

  const tip = tipId ? NODE_INFO[tipId] : undefined;
  const portraitAt = tipId ? PORTRAIT.at[tipId] : undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <p role="status" aria-live="polite" className="sr-only">
        {summary}
      </p>

      {/* One planner for every screen size: the chips. */}
      <PlannerPills route={route} onRoute={setRoute} />

      {/* Phones and tablets: portrait map, board under the chips (beside the map on tablets) */}
      <div className="mt-4 min-[1180px]:hidden">
        {!active && (
          <p className="mb-4 max-w-[34ch] text-[0.9375rem] leading-snug text-ink-soft md:hidden">
            Touchez une ligne ou une station pour voir son détail.
          </p>
        )}
        <div className="md:grid md:grid-cols-[22rem_minmax(0,1fr)] md:items-start md:gap-8 lg:grid-cols-[26rem_minmax(0,1fr)]">
          <div className="mb-5 md:order-2 md:sticky md:top-24 md:mb-0">
            <BoardPanel
              route={active}
              onClose={() => setRoute(null)}
              block={block}
              compact
              className={cn(!active && "max-md:hidden")}
            />
            <Legend className="mt-6 hidden md:block" />
          </div>
          <div className="relative mx-auto w-full max-w-[26rem] md:order-1 md:mx-0" onClick={clearPin}>
            <PortraitDiagram route={route} hoverId={tipId} onSelect={onSelectNode} onHover={setHoverId} />
            {tipId && tip && portraitAt && (
              <Tooltip
                id={tipId}
                at={portraitAt}
                box={{ w: PW, h: PORTRAIT.height }}
                below={portraitAt.y < PORTRAIT.height * 0.55}
              />
            )}
          </div>
        </div>
        <Legend className="mt-8 md:hidden" />
      </div>

      {/* Desktop: board dock + diagram */}
      <div className="mt-5 hidden items-stretch gap-6 min-[1180px]:grid min-[1180px]:grid-cols-[15.5rem_minmax(0,1fr)] min-[1280px]:mr-[min(0px,calc((80rem_-_100vw)/2_+_1rem))]">
        <div className="flex min-h-0 flex-col gap-4">
          <BoardPanel route={active} onClose={() => setRoute(null)} block={block} className="flex-1" />
          <Legend />
        </div>
        <div className="relative" onClick={clearPin}>
          <NetworkDiagram
            svgRef={svgRef}
            route={route}
            hoverId={tipId}
            animate={animate}
            onSelect={onSelectNode}
            onHover={setHoverId}
          />
          {tipId && tip && (
            <Tooltip id={tipId} at={{ x: tip.at[0], y: tip.at[1] }} box={{ w: VB_W, h: VB_H }} below={tip.at[1] < 175} />
          )}
        </div>
      </div>
    </div>
  );
}
