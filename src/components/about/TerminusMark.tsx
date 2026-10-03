import { cn } from "@/lib/utils";

interface TerminusMarkProps {
  colors: readonly string[];
  /** Colour of the buffer bar and station rings. */
  bar?: string;
  className?: string;
}

/**
 * Lines arriving at the terminus: parallel strokes bend at 45° and end
 * against a buffer bar. Decorative.
 */
export function TerminusMark({
  colors,
  bar = "#fff",
  className,
}: TerminusMarkProps) {
  const n = colors.length;
  const targetGap = 24;
  const cy = 80;
  const t0 = cy - ((n - 1) * targetGap) / 2;
  const startGap = 44;
  const s0 = cy - ((n - 1) * startGap) / 2;
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 380 160"
      className={cn("block h-auto w-full", className)}
    >
      {colors.map((c, i) => {
        const sy = s0 + i * startGap;
        const ty = t0 + i * targetGap;
        const dy = Math.abs(ty - sy);
        const xBend = 70 + (n - 1 - Math.abs(i - (n - 1) / 2) * 2) * 8;
        const dir = ty > sy ? 1 : -1;
        const d = `M0 ${sy} H${xBend} l${dy} ${dir * dy} H322`;
        return (
          <g key={`${c}-${i}`}>
            <path
              d={d}
              fill="none"
              stroke={c}
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={282}
              cy={ty}
              r={9}
              fill="#fff"
              stroke={bar}
              strokeWidth={4}
            />
          </g>
        );
      })}
      <rect
        x={330}
        y={cy - 62}
        width={12}
        height={124}
        rx={3}
        fill={bar}
      />
    </svg>
  );
}
