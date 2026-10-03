import { cn } from "@/lib/utils";
import styles from "./RouteBand.module.css";

interface RouteBandProps {
  /** Line colours, drawn as parallel octilinear strokes. */
  colors: readonly string[];
  /** Station ring colour (ink on light grounds, night on dark ones). */
  ring?: string;
  className?: string;
}

const W = 1600;
const H = 120;
const GAP = 26;
const D = 28;

/**
 * Decorative route band: a bundle of parallel lines that bend at 45° with
 * ringed stations. Purely visual (aria-hidden); drawn in once with CSS only.
 */
export function RouteBand({
  colors,
  ring = "#0b1b3a",
  className,
}: RouteBandProps) {
  const n = colors.length;
  const y0 = H / 2 - ((n - 1) * GAP) / 2;
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-20 w-full sm:h-24", className)}
    >
      {colors.map((c, i) => {
        const y = y0 + i * GAP;
        const xa = 430 + i * 6;
        const xb = 1010 + i * 6;
        const d = `M0 ${y} H${xa} l${D} ${D} H${xb} l${D} ${-D} H${W}`;
        return (
          <g key={`${c}-${i}`}>
            <path
              d={d}
              pathLength={1}
              fill="none"
              stroke={c}
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.draw}
            />
            <circle
              cx={200 + i * 150}
              cy={y}
              r={9}
              fill="#fff"
              stroke={ring}
              strokeWidth={4}
              className={styles.dot}
            />
            <circle
              cx={760 + i * 70}
              cy={y + D}
              r={9}
              fill="#fff"
              stroke={ring}
              strokeWidth={4}
              className={styles.dot}
            />
            <circle
              cx={1330 + i * 60}
              cy={y}
              r={9}
              fill="#fff"
              stroke={ring}
              strokeWidth={4}
              className={styles.dot}
            />
          </g>
        );
      })}
    </svg>
  );
}
