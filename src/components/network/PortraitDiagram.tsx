import type { CSSProperties } from "react";
import type { LineId } from "@/lib/network";
import { ACADEMIE, DEMO_HREF, SERVICES, getRoute, lineById, LINES } from "./data";
import type { RouteId } from "./data";
import { Node, lineOpacity, nodeAttrs, ringOpacity, serviceOpacity } from "./NetworkDiagram";
import { P_DOT, P_FONT, P_LH, P_STROKE, PW, buildPortrait } from "./portrait";
import type { PNode } from "./portrait";
import styles from "./NetworkMap.module.css";

const INK = "#0b1b3a";
const ENAMEL = "#f3f5fa";
const VIOLET_TEXT = "#4a24b8";

const NAMES = Object.fromEntries(LINES.map((l) => [l.id, l.name])) as Record<(typeof LINES)[number]["id"], string>;

/** The layout is computed once: it is pure data. */
export const PORTRAIT = buildPortrait(NAMES);
export const PORTRAIT_H = PORTRAIT.height;

interface Props {
  route: RouteId | null;
  hoverId: string | null;
  onSelect?: (nodeId: string) => void;
  onHover?: (nodeId: string | null) => void;
  intro?: boolean;
}

function PLabel({ n, fill, emphasis }: { n: PNode; fill: string; emphasis: boolean }) {
  const first = n.y + 5 - ((n.label.length - 1) * P_LH) / 2;
  return (
    <text
      x={n.lx}
      y={first}
      textAnchor={n.anchor}
      fontSize={P_FONT}
      fontWeight={emphasis ? 700 : 600}
      fill={fill}
      stroke={ENAMEL}
      strokeWidth={4}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={{ fontFamily: "var(--font-text, system-ui)" }}
    >
      {n.label.map((t, i) => (
        <tspan key={t} x={n.lx} dy={i === 0 ? 0 : P_LH}>
          {t}
        </tspan>
      ))}
    </text>
  );
}

function PNodeShape({ n, scale }: { n: PNode; scale: number }) {
  if (n.kind === "interchange" && n.span) {
    const r = 9;
    return (
      <rect
        x={n.span[0] - r}
        y={n.y - r}
        width={n.span[1] - n.span[0] + r * 2}
        height={r * 2}
        rx={r}
        fill="#fff"
        stroke={INK}
        strokeWidth={3}
      />
    );
  }
  if (n.kind === "interchange") {
    return <circle cx={n.x} cy={n.y} r={9 * scale} fill="#fff" stroke={INK} strokeWidth={3} />;
  }
  return <Node at={[n.x, n.y]} interchange={false} ring={INK} scale={(P_DOT / 7.5) * scale} />;
}

/**
 * Portrait octilinear network for phones and tablets: parallel coloured
 * strokes with ringed stations, the violet Académie loop and the terminus.
 * Same state model as the desktop diagram (route dims / traces / selects).
 */
export function PortraitDiagram({ route, hoverId, onSelect, onHover, intro = true }: Props) {
  const routeDef = getRoute(route);
  const { strands, nodes, ring, terminus } = PORTRAIT;
  const lift = (id: string) => hoverId === id;
  const d = (ms: number): CSSProperties | undefined =>
    intro ? ({ ["--d" as string]: `${ms}ms` } as CSSProperties) : undefined;

  const opacityFor = (n: PNode): number => {
    if (n.id.startsWith("svc-")) return serviceOpacity(route, n.id, svcLines(n.id));
    if (n.id.startsWith("aca-")) return ringOpacity(route);
    return n.line ? lineOpacity(route, n.line) : 1;
  };

  return (
    <svg
      viewBox={`0 0 ${PW} ${PORTRAIT.height}`}
      className={styles.svg}
      role="group"
      aria-label="Réseau Alliance Consultants en plan vertical : six lignes de solutions, leurs modules, les services en correspondance, la ligne Académie et le terminus Demander une démo"
      data-route={route ?? "all"}
    >
      {/* ── Académie loop ── */}
      <g className={styles.dim} style={{ opacity: ringOpacity(route) }}>
        <path
          d={ring.path}
          fill="none"
          stroke={ACADEMIE.color}
          strokeWidth={P_STROKE}
          strokeLinejoin="round"
          className={intro ? styles.draw : undefined}
          pathLength={1}
          style={d(150)}
        />
        {route === "academie" && (
          <path d={ring.path} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 12" className={styles.flow} />
        )}
      </g>

      {/* ── Line strokes ── */}
      {strands.map((s, i) => {
        const l = lineById(s.line);
        const isActive = routeDef?.active.includes(s.line);
        return (
          <g key={s.line} className={styles.dim} style={{ opacity: lineOpacity(route, s.line) }}>
            <path
              d={s.path}
              fill="none"
              stroke={l.color}
              strokeWidth={P_STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={intro ? styles.draw : undefined}
              pathLength={1}
              style={d(i * 110)}
            />
            {isActive && (
              <path d={s.path} fill="none" stroke={l.onColor} strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 12" className={styles.flow} />
            )}
          </g>
        );
      })}

      {/* ── Line-name badges ── */}
      {strands.map((s, i) => {
        const l = lineById(s.line);
        return (
          <g key={s.line} className={`${styles.dim} ${intro ? styles.fade : ""}`} style={{ opacity: lineOpacity(route, s.line), ...(d(450 + i * 90) ?? {}) }}>
            <rect x={s.badge.x} y={s.badge.y - 13} width={s.badge.w} height={26} rx={13} fill={l.color} />
            <text
              x={s.badge.x + s.badge.w / 2}
              y={s.badge.y + 5}
              textAnchor="middle"
              fontSize={P_FONT}
              fontWeight={800}
              fill={l.onColor}
              style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))" }}
            >
              {l.name}
            </text>
          </g>
        );
      })}

      {/* ── Académie name ── */}
      <g aria-hidden="true" className={`${styles.dim}`} style={{ opacity: ringOpacity(route) }}>
        <rect x={ring.badge.x} y={ring.badge.y - 13} width={ring.badge.w} height={26} rx={13} fill={ACADEMIE.color} />
        <text
          x={ring.badge.x + ring.badge.w / 2}
          y={ring.badge.y + 5}
          textAnchor="middle"
          fontSize={P_FONT}
          fontWeight={800}
          fill={ACADEMIE.onColor}
          style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))" }}
        >
          Académie
        </text>
      </g>

      {/* ── Stations, interchanges, formations ── */}
      {nodes.map((n) => {
        const aca = n.id.startsWith("aca-");
        const hot = lift(n.id) || (aca ? route === "academie" : routeDef?.active.includes(n.line!)) || (n.id === "svc-ia" && route === "ia");
        const fill = aca ? VIOLET_TEXT : INK;
        return (
          <g
            key={n.id}
            className={`${styles.dim} ${intro ? styles.fade : ""}`}
            style={{ opacity: opacityFor(n), ...(d(800) ?? {}) }}
          >
            <g {...nodeAttrs({ interactive: true, route, id: n.id, onSelect, onHover })} data-node={n.id}>
              <rect x={n.hit.x} y={n.hit.y} width={n.hit.w} height={n.hit.h} fill="transparent" />
              <g className={styles.pop} style={{ transformOrigin: `${n.x}px ${n.y}px`, transform: lift(n.id) ? "scale(1.25)" : undefined }}>
                <PNodeShape n={n} scale={1} />
              </g>
              <PLabel n={n} fill={fill} emphasis={!!hot} />
            </g>
          </g>
        );
      })}

      {/* ── Terminus ── */}
      <a href={DEMO_HREF} className={styles.terminus} aria-label="Terminus : demander une démo">
        <rect x={terminus.x - terminus.r - 6} y={terminus.y - terminus.r - 6} width={PW - 2 * (terminus.x - terminus.r - 6)} height={terminus.r * 2 + 12} fill="transparent" />
        <circle cx={terminus.x} cy={terminus.y} r={terminus.r} fill={INK} />
        <circle cx={terminus.x} cy={terminus.y} r={terminus.r - 6} fill="none" stroke="#fff" strokeWidth={2.5} />
        <path
          d={`M${terminus.x - 8} ${terminus.y}h16M${terminus.x + 3} ${terminus.y - 6}l6 6-6 6`}
          fill="none"
          stroke="#fff"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={terminus.x + terminus.r + 16} y={terminus.y - 2} fontSize={18} fontWeight={800} fill={INK} style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))" }}>
          Demander
        </text>
        <text x={terminus.x + terminus.r + 16} y={terminus.y + 19} fontSize={18} fontWeight={800} fill={INK} style={{ fontFamily: "var(--font-display, var(--font-text, system-ui))" }}>
          une démo
        </text>
      </a>
    </svg>
  );
}


function svcLines(id: string): LineId[] {
  return SERVICES.find((s) => s.id === id)?.lines ?? [];
}
