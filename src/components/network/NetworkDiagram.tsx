import type { CSSProperties, KeyboardEvent, Ref } from "react";
import type { LineId } from "@/lib/network";
import {
  ACADEMIE,
  ACADEMIE_STATIONS,
  LINE_GEO,
  LINES,
  RING_BADGE,
  RING_PTS,
  SERVICES,
  STROKE,
  TERMINUS,
  VB_H,
  VB_W,
  DEMO_HREF,
  getRoute,
  polylineLength,
  roundedPath,
  sideLabel,
} from "./data";
import type { LabelAt, Pt, RouteId } from "./data";
import { NODE_INFO, nodeAriaLabel } from "./nodes";
import styles from "./NetworkMap.module.css";

const INK = "#0b1b3a";
const ENAMEL = "#f3f5fa";
const CORNER = 16;
const TRAIN_SPEED = 62; // user units per second
export const LABEL_FONT = 15.5;

export const LINE_PATH: Record<LineId, string> = Object.fromEntries(
  LINES.map((l) => [l.id, roundedPath(LINE_GEO[l.id].pts, CORNER)]),
) as Record<LineId, string>;
export const RING_PATH = roundedPath(RING_PTS, CORNER, true);

const LINE_LEN: Record<LineId, number> = Object.fromEntries(
  LINES.map((l) => [l.id, polylineLength(LINE_GEO[l.id].pts)]),
) as Record<LineId, number>;
const RING_LEN = polylineLength(RING_PTS, true);

export interface DiagramProps {
  route: RouteId | null;
  hoverId: string | null;
  /** Mount flag: trains are only rendered on the client, when motion is OK. */
  animate: boolean;
  /** Static render (LineMiniMap / previews). */
  interactive?: boolean;
  onSelect?: (nodeId: string) => void;
  onHover?: (nodeId: string | null) => void;
  svgRef?: Ref<SVGSVGElement>;
  /** Draw-in intro on first paint. */
  intro?: boolean;
}

export function lineOpacity(route: RouteId | null, id: LineId): number {
  if (!route) return 1;
  const r = getRoute(route);
  if (!r) return 1;
  if (r.active.includes(id)) return 1;
  if (r.related.includes(id)) return 0.5;
  return 0.18;
}
export function ringOpacity(route: RouteId | null): number {
  if (!route) return 1;
  return route === "academie" ? 1 : 0.18;
}
export function serviceOpacity(route: RouteId | null, svcId: string, lines: LineId[]): number {
  if (!route) return 1;
  const r = getRoute(route);
  if (!r) return 1;
  if (route === "ia") return svcId === "svc-ia" ? 1 : 0.18;
  if (route === "academie") return 0.18;
  return lines.some((l) => r.active.includes(l)) ? 1 : 0.18;
}

export function Label({
  at,
  lines,
  emphasis,
  size = LABEL_FONT,
  fill = INK,
}: {
  at: LabelAt & { lh?: number };
  lines: string[];
  emphasis: boolean;
  size?: number;
  fill?: string;
}) {
  const lh = at.lh ?? 16;
  return (
    <text
      x={at.x}
      y={at.y}
      textAnchor={at.anchor}
      fontSize={size}
      fontWeight={emphasis ? 700 : 600}
      fill={fill}
      stroke={ENAMEL}
      strokeWidth={4}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ fontFamily: "var(--font-text, system-ui)", letterSpacing: "0.005em" }}
    >
      {lines.map((t, i) => (
        <tspan key={t} x={at.x} dy={i === 0 ? 0 : lh}>
          {t}
        </tspan>
      ))}
    </text>
  );
}

/** Dot or capsule (interchange). `to` makes a capsule between two tracks. */
export function Node({
  at,
  to,
  interchange,
  ring = INK,
  scale = 1,
}: {
  at: Pt;
  to?: Pt;
  interchange: boolean;
  ring?: string;
  scale?: number;
}) {
  if (interchange) {
    const r = 9.5;
    if (to) {
      const x = Math.min(at[0], to[0]) - r;
      const y = Math.min(at[1], to[1]) - r;
      const w = Math.abs(to[0] - at[0]) + r * 2;
      const h = Math.abs(to[1] - at[1]) + r * 2;
      return <rect x={x} y={y} width={w} height={h} rx={r} fill="#fff" stroke={ring} strokeWidth={3.5} />;
    }
    return <circle cx={at[0]} cy={at[1]} r={r * scale} fill="#fff" stroke={ring} strokeWidth={3.5} />;
  }
  return <circle cx={at[0]} cy={at[1]} r={7.5 * scale} fill="#fff" stroke={ring} strokeWidth={3} />;
}

function Train({
  path,
  len,
  begin,
  big,
}: {
  path: string;
  len: number;
  begin: number;
  big?: boolean;
}) {
  const dur = Math.max(4, len / (big ? TRAIN_SPEED * 1.6 : TRAIN_SPEED));
  const w = big ? 22 : 16;
  const h = big ? 11 : 8;
  return (
    <g opacity={0}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill="#fff" stroke={INK} strokeWidth={big ? 2 : 1.6} />
      <rect x={-w / 2 + 3} y={-h / 2 + 2.2} width={w / 3} height={h - 4.4} rx={1.2} fill={INK} opacity={0.85} />
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} rotate="auto" begin={`${-begin}s`} />
      <animate attributeName="opacity" dur={`${dur}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.05;0.93;1" begin={`${-begin}s`} />
    </g>
  );
}

/** Shared button semantics for a clickable map node (desktop + portrait). */
export function nodeAttrs({
  interactive,
  route,
  id,
  onSelect,
  onHover,
}: {
  interactive: boolean;
  route: RouteId | null;
  id: string;
  onSelect?: (nodeId: string) => void;
  onHover?: (nodeId: string | null) => void;
}) {
  if (!interactive) return { "aria-hidden": true as const };
  return {
    role: "button" as const,
    tabIndex: !route || NODE_INFO[id]?.route === route ? 0 : -1,
    "aria-label": nodeAriaLabel(id),
    className: styles.node,
    onClick: () => onSelect?.(id),
    onMouseEnter: () => onHover?.(id),
    onMouseLeave: () => onHover?.(null),
    onFocus: () => onHover?.(id),
    onBlur: () => onHover?.(null),
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.(id);
      }
    },
  };
}

export function NetworkDiagram({
  route,
  hoverId,
  animate,
  interactive = true,
  onSelect,
  onHover,
  svgRef,
  intro = true,
}: DiagramProps) {
  const routeDef = getRoute(route);
  const lift = (nodeId: string) => hoverId === nodeId;

  const nodeProps = (nodeId: string) =>
    nodeAttrs({ interactive, route, id: nodeId, onSelect, onHover });

  const introStyle = (delay: number): CSSProperties | undefined =>
    intro ? ({ ["--d" as string]: `${delay}ms` } as CSSProperties) : undefined;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={styles.svg}
      role="group"
      aria-label="Réseau Alliance Consultants : six lignes de solutions, leurs modules, les services en correspondance, la ligne Académie et le terminus Demander une démo"
      data-route={route ?? "all"}
    >
      {/* ── Académie ring ── */}
      <g className={styles.dim} style={{ opacity: ringOpacity(route) }}>
        <path
          d={RING_PATH}
          fill="none"
          stroke={ACADEMIE.color}
          strokeWidth={STROKE}
          strokeLinejoin="round"
          className={intro ? styles.draw : undefined}
          pathLength={1}
          style={introStyle(150)}
        />
        {route === "academie" && (
          <path d={RING_PATH} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 14" className={styles.flow} />
        )}
      </g>

      {/* ── Lines ── */}
      {LINES.map((l, i) => {
        const isActive = routeDef?.active.includes(l.id);
        return (
          <g key={l.id} className={styles.dim} style={{ opacity: lineOpacity(route, l.id) }}>
            <path
              d={LINE_PATH[l.id]}
              fill="none"
              stroke={l.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={intro ? styles.draw : undefined}
              pathLength={1}
              style={introStyle(i * 110)}
            />
            {isActive && (
              <path d={LINE_PATH[l.id]} fill="none" stroke={l.onColor} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 14" className={styles.flow} />
            )}
          </g>
        );
      })}

      {/* ── Trains ── */}
      {animate && (
        <g aria-hidden="true" pointerEvents="none">
          {!route &&
            LINES.map((l, i) => (
              <Train key={l.id} path={LINE_PATH[l.id]} len={LINE_LEN[l.id]} begin={i * 3.1 + 1} />
            ))}
          {!route && <Train path={RING_PATH} len={RING_LEN} begin={2} />}
          {routeDef &&
            (routeDef.id === "academie" ? (
              <Train key="r-aca" path={RING_PATH} len={RING_LEN} begin={0} big />
            ) : (
              (routeDef.active.length ? routeDef.active : routeDef.related.slice(0, 1)).map((id) => (
                <Train key={`r-${id}`} path={LINE_PATH[id]} len={LINE_LEN[id]} begin={0} big />
              ))
            ))}
        </g>
      )}

      {/* ── Line stations ── */}
      {LINES.map((l, i) => {
        const g = LINE_GEO[l.id];
        const active = routeDef?.active.includes(l.id);
        return (
          <g key={l.id} className={`${styles.dim} ${intro ? styles.fade : ""}`} style={{ opacity: lineOpacity(route, l.id), ...(introStyle(700 + i * 90) ?? {}) }}>
            {/* name badge (above the trains) */}
            <g className={intro ? styles.fade : undefined} style={introStyle(500 + i * 90)}>
              <rect x={g.badge.x} y={g.pts[0][1] - 12.5} width={g.badge.w} height={25} rx={12.5} fill={l.color} />
              <text
                x={g.badge.x + g.badge.w / 2}
                y={g.pts[0][1] + 5}
                textAnchor="middle"
                fontSize={14}
                fontWeight={800}
                fill={l.onColor}
                style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))", letterSpacing: "0.01em" }}
              >
                {l.name}
              </text>
            </g>
            {g.stations.map((s) => {
              const hot = lift(s.id) || !!active;
              const lp = sideLabel(s.at, s.side, s.label.length);
              return (
                <g key={s.id} {...nodeProps(s.id)} data-node={s.id}>
                  <circle cx={s.at[0]} cy={s.at[1]} r={18} fill="transparent" />
                  <g className={styles.pop} style={{ transformOrigin: `${s.at[0]}px ${s.at[1]}px`, transform: lift(s.id) ? "scale(1.3)" : undefined }}>
                    <Node at={s.at} interchange={false} ring={INK} />
                  </g>
                  <Label at={lp} lines={s.label} emphasis={hot} />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ── Services = interchanges ── */}
      {SERVICES.map((s, i) => {
        const hot = lift(s.id) || route === "ia" && s.id === "svc-ia";
        return (
          <g
            key={s.id}
            className={`${styles.dim} ${intro ? styles.fade : ""}`}
            style={{ opacity: serviceOpacity(route, s.id, s.lines), ...(introStyle(900 + i * 70) ?? {}) }}
          >
            <g {...nodeProps(s.id)} data-node={s.id}>
              <rect
                x={Math.min(s.at[0], (s.to ?? s.at)[0]) - 16}
                y={Math.min(s.at[1], (s.to ?? s.at)[1]) - 16}
                width={Math.abs((s.to ?? s.at)[0] - s.at[0]) + 32}
                height={Math.abs((s.to ?? s.at)[1] - s.at[1]) + 32}
                fill="transparent"
              />
              <Node at={s.at} to={s.to} interchange scale={lift(s.id) ? 1.2 : 1} />
              <Label at={{ ...s.labelAt, lh: 16 }} lines={s.label} emphasis={hot} fill={INK} />
            </g>
          </g>
        );
      })}

      {/* ── Académie stations ── */}
      <g className={`${styles.dim} ${intro ? styles.fade : ""}`} style={{ opacity: ringOpacity(route), ...(introStyle(1000) ?? {}) }}>
        {ACADEMIE_STATIONS.map((s) => {
          const crossing = !!s.to;
          const hot = lift(s.id) || route === "academie";
          return (
            <g key={s.id} {...nodeProps(s.id)} data-node={s.id}>
              <rect x={Math.min(s.at[0], (s.to ?? s.at)[0]) - 16} y={Math.min(s.at[1], (s.to ?? s.at)[1]) - 16} width={Math.abs((s.to ?? s.at)[0] - s.at[0]) + 32} height={Math.abs((s.to ?? s.at)[1] - s.at[1]) + 32} fill="transparent" />
              <Node at={s.at} to={s.to} interchange={crossing} ring={INK} />
              <Label at={{ ...s.labelAt, lh: 16 }} lines={s.label} emphasis={hot} fill="#4a24b8" />
            </g>
          );
        })}
        {/* ring name: same pill as the line names, sitting on the loop */}
        <g aria-hidden="true">
          <rect x={RING_BADGE.x} y={RING_BADGE.y - 12.5} width={RING_BADGE.w} height={25} rx={12.5} fill={ACADEMIE.color} />
          <text
            x={RING_BADGE.x + RING_BADGE.w / 2}
            y={RING_BADGE.y + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={800}
            fill={ACADEMIE.onColor}
            style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))", letterSpacing: "0.01em" }}
          >
            Académie
          </text>
        </g>
      </g>

      {/* ── Terminus ── */}
      <a
        href={DEMO_HREF}
        className={styles.terminus}
        aria-label="Terminus : demander une démo"
        tabIndex={interactive ? 0 : -1}
      >
        <circle cx={TERMINUS.at[0]} cy={TERMINUS.at[1]} r={TERMINUS.r + 14} fill="transparent" />
        <circle cx={TERMINUS.at[0]} cy={TERMINUS.at[1]} r={TERMINUS.r} fill={INK} />
        <circle cx={TERMINUS.at[0]} cy={TERMINUS.at[1]} r={TERMINUS.r - 5} fill="none" stroke="#fff" strokeWidth={2.5} />
        <path
          transform={`translate(${TERMINUS.at[0]} ${TERMINUS.at[1]})`}
          d="M-6 0h12M2.5 -5l5.5 5-5.5 5"
          fill="none"
          stroke="#fff"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.terminusArrow}
        />
        <text x={TERMINUS.at[0] + 36} y={TERMINUS.at[1] + 7} fontSize={17} fontWeight={800} fill={INK} style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))" }}>
          Demander
        </text>
        <text x={TERMINUS.at[0] + 36} y={TERMINUS.at[1] + 26} fontSize={17} fontWeight={800} fill={INK} style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))" }}>
          une démo
        </text>
      </a>
    </svg>
  );
}
