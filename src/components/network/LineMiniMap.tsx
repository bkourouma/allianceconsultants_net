import { getLine } from "@/lib/network";
import type { LineId } from "@/lib/network";
import { LINE_GEO, roundedPath } from "./data";
import type { Pt } from "./data";

export interface LineMiniMapProps {
  /** Line id ("medicpro") or solution slug ("immotopia-cloud"). */
  line: string;
  className?: string;
  /** Show the station names under the dots (default true). */
  labels?: boolean;
  /** Light labels for night / colour backgrounds. */
  onDark?: boolean;
  /** When given, the strip is exposed to assistive tech; otherwise decorative. */
  title?: string;
}

/**
 * Static, decorative strip diagram of one line: the line (with one 45° bend),
 * its real modules as ringed stations, and a small terminus roundel.
 * Scales with its container (viewBox 640 × 96 / 640 × 44 without labels).
 */
export function LineMiniMap({ line, className, labels = true, onDark = false, title }: LineMiniMapProps) {
  const l = getLine(line);
  if (!l) return null;
  const geo = LINE_GEO[l.id as LineId];
  const stations = geo.stations;
  const n = stations.length;
  const y = 26;
  const pts: Pt[] = [[14, y + 26], [78, y + 26], [104, y], [604, y]];
  const x0 = 170;
  const x1 = 540;
  const h = labels ? 96 : 52;
  const ink = onDark ? "#ffffff" : "#0b1b3a";
  return (
    <svg
      viewBox={`0 0 640 ${h}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={roundedPath(pts, 14)} fill="none" stroke={l.color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
      {stations.map((s, i) => {
        const x = n === 1 ? (x0 + x1) / 2 : x0 + (i * (x1 - x0)) / (n - 1);
        return (
          <g key={s.id}>
            <circle cx={x} cy={y} r={7.5} fill="#fff" stroke="#0b1b3a" strokeWidth={3} />
            {labels && (
              <text
                x={x}
                y={y + 28}
                textAnchor="middle"
                fontSize={12.5}
                fontWeight={650}
                fill={ink}
                style={{ fontFamily: "var(--font-text, system-ui)" }}
              >
                {s.label.map((t, k) => (
                  <tspan key={t} x={x} dy={k === 0 ? 0 : 14}>
                    {t}
                  </tspan>
                ))}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={616} cy={y} r={13} fill="#0b1b3a" stroke={onDark ? "#ffffff" : "none"} strokeWidth={2} />
      <path d="M611 26h10M618 22l4 4-4 4" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
