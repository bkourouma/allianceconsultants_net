"use client";

import { useEffect, useId, useRef } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES, contactHref } from "./data";
import type { RouteDef, RouteId } from "./data";

export function routeStyle(route: RouteDef): CSSProperties {
  return { "--accent": route.color, "--on-accent": route.onColor } as CSSProperties;
}

/* ───────────── shared atoms ───────────── */

/** Station symbol for a route: dot (line), white ring (service), violet dot (Académie). */
export function RouteDot({ route, className }: { route: RouteDef; className?: string }) {
  const service = route.id === "ia";
  return (
    <span
      aria-hidden
      className={cn("inline-block size-4 shrink-0 rounded-full", className)}
      style={
        service
          ? { background: "#fff", boxShadow: "inset 0 0 0 3.5px #0b1b3a" }
          : { background: route.color, boxShadow: "0 0 0 2px #fff, 0 0 0 3.5px rgba(11,27,58,.9)" }
      }
    />
  );
}

/** Line-coloured pill CTA with an inverse arrow roundel. */
export function BoardCta({ route, block = "hero", className }: { route: RouteDef; block?: string; className?: string }) {
  return (
    <a
      href={contactHref(route, block)}
      style={routeStyle(route)}
      className={cn(
        "group/cta inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-[var(--accent)] pl-4 pr-1.5 text-[0.875rem] font-bold whitespace-nowrap text-[var(--on-accent)] no-underline transition-[transform,filter] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-px hover:brightness-110 active:translate-y-px focus-visible:outline-ink!",
        className,
      )}
    >
      {route.ctaLabel}
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--on-accent)] text-[var(--accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
      >
        <ArrowRight className="size-4" strokeWidth={2.25} />
      </span>
    </a>
  );
}

/** Body of the station board: pitch, real modules as a vertical line, CTAs. */
export function BoardBody({
  route,
  block,
  onReset,
  bare,
  compact,
  className,
}: {
  route: RouteDef;
  block?: string;
  onReset?: () => void;
  /** No own border / radius (when already inside a framed panel). */
  bare?: boolean;
  /** Phones: the map already names the modules, so the list is skipped. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      style={routeStyle(route)}
      className={cn(
        "bg-panel px-4 pb-4 pt-3.5",
        !bare && "rounded-b-[8px] border border-t-0 border-rule",
        className,
      )}
    >
      <p className="text-[0.875rem] leading-[1.45] text-ink-soft">{route.pitch}</p>

      <div className={cn(compact && "max-md:hidden")}>
      <p className="mt-3.5 text-[0.875rem] font-bold text-ink">{route.modulesTitle}</p>
      <ol className="relative mt-1.5 before:absolute before:bottom-3 before:left-[5.5px] before:top-3 before:w-[5px] before:rounded-full before:bg-[var(--accent)] before:content-['']">
        {route.modules.map((m) => (
          <li key={m.name} className="relative flex items-start gap-3 py-[3px] text-[0.8125rem] leading-snug">
            <span
              aria-hidden
              className="relative z-10 mt-px size-[16px] shrink-0 rounded-full border-[3px] border-ink bg-panel"
            />
            <span className="min-w-0">
              <span className="block font-semibold text-ink">{m.name}</span>
              {m.hint && <span className="block truncate text-[0.75rem] text-ink-mute">{m.hint}</span>}
            </span>
          </li>
        ))}
      </ol>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <BoardCta route={route} block={block} />
        <a
          href={route.moreHref}
          className="group/more inline-flex min-h-11 items-center gap-1.5 text-[0.875rem] font-bold text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
        >
          {route.moreLabel}
          <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/more:translate-x-0.5" strokeWidth={2} />
        </a>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-mute transition-colors hover:text-ink"
        >
          <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
          Voir tout le réseau
        </button>
      )}
    </div>
  );
}

/* ───────────── keyboard (radio group) ───────────── */

function useRadioKeys(route: RouteId | null, onRoute: (id: RouteId | null) => void, focusRoute: (id: RouteId) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (e.key === "Escape" && route) {
      e.preventDefault();
      onRoute(null);
      return;
    }
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = ROUTES.findIndex((r) => r.id === route);
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i < 0 ? 0 : (i + 1) % ROUTES.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i < 0 ? ROUTES.length - 1 : (i - 1 + ROUTES.length) % ROUTES.length;
    else if (e.key === "Home") next = 0;
    else next = ROUTES.length - 1;
    const id = ROUTES[next].id;
    onRoute(id);
    focusRoute(id);
  };
}

interface PlannerProps {
  route: RouteId | null;
  onRoute: (id: RouteId | null) => void;
  block?: string;
}

/* ───────────── journey planner chips (every screen size) ───────────── */

export function PlannerPills({ route, onRoute }: PlannerProps) {
  const uid = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKeyDown = useRadioKeys(route, onRoute, (id) => refs.current[id]?.focus());

  useEffect(() => {
    if (!route) return;
    /* Centre the chip inside its own scroller — never scroll the page. */
    const el = refs.current[route];
    const sc = el?.closest<HTMLElement>("[data-chips]");
    if (!el || !sc) return;
    const a = el.getBoundingClientRect();
    const b = sc.getBoundingClientRect();
    sc.scrollTo({ left: sc.scrollLeft + a.left - b.left - (b.width - a.width) / 2, behavior: "smooth" });
  }, [route]);

  return (
    <div className="min-[1180px]:flex min-[1180px]:items-center min-[1180px]:gap-4">
      <p id={`${uid}-l`} className="font-display text-[1.25rem] font-bold tracking-tight text-ink min-[1180px]:shrink-0 min-[1180px]:text-[1.125rem]">
        Je cherche…
      </p>
      <div data-chips className="-mx-[clamp(1rem,4vw,2.5rem)] mt-3 overflow-x-auto px-[clamp(1rem,4vw,2.5rem)] pb-2 [scrollbar-width:none] min-[1180px]:mx-0 min-[1180px]:mt-0 min-[1180px]:overflow-visible min-[1180px]:px-0 min-[1180px]:pb-0 [&::-webkit-scrollbar]:hidden">
        <div
          role="radiogroup"
          aria-labelledby={`${uid}-l`}
          onKeyDown={onKeyDown}
          className="flex w-max snap-x gap-2 min-[1180px]:w-auto min-[1180px]:flex-wrap min-[1180px]:gap-1.5"
        >
          {ROUTES.map((r, i) => {
            const sel = r.id === route;
            return (
              <button
                key={r.id}
                ref={(el) => {
                  refs.current[r.id] = el;
                }}
                type="button"
                role="radio"
                aria-checked={sel}
                tabIndex={sel || (!route && i === 0) ? 0 : -1}
                onClick={() => onRoute(sel ? null : r.id)}
                style={routeStyle(r)}
                className={cn(
                  "inline-flex min-h-11 snap-start items-center gap-2.5 rounded-full border px-4 text-[0.875rem] font-semibold whitespace-nowrap transition-colors duration-200 min-[1180px]:min-h-10 min-[1180px]:gap-0 min-[1180px]:border-b-[3px] min-[1180px]:px-2.5 min-[1180px]:text-[0.78rem]",
                  sel
                    ? "border-transparent bg-[var(--accent)] text-[var(--on-accent)] focus-visible:outline-ink!"
                    : "border-rule bg-panel text-ink hover:border-ink min-[1180px]:border-b-[var(--accent)]",
                )}
              >
                {!sel && <RouteDot route={r} className="size-3.5 min-[1180px]:hidden" />}
                {r.planner}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
