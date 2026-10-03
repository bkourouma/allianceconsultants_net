import { LINES, ACADEMIE } from "@/lib/network";
import { cn } from "@/lib/utils";
import { hashString, postLineId, seededRandom } from "./post-utils";

/**
 * Authored generative cover: an octilinear line-strip drawing ("a route")
 * derived deterministically from a slug. Same slug → same route, always.
 * Pure SVG, no stock imagery, no client JS.
 */

const CELL = 40;
const COLS = 16;
const ROWS = 9;

const TONES = {
  night: { bg: "#07122b", station: "#ffffff", ring: "#07122b" },
  panel: { bg: "#ffffff", station: "#ffffff", ring: "#0b1b3a" },
  enamel: { bg: "#f3f5fa", station: "#ffffff", ring: "#0b1b3a" },
} as const;

type Step = [number, number];

const MOVES: Step[] = [
  [1, 0], // E
  [1, -1], // NE
  [1, 1], // SE
];

function buildRoute(rand: () => number): [number, number][] {
  let x = 0;
  let y = 1 + Math.floor(rand() * (ROWS - 2));
  const pts: [number, number][] = [[x, y]];
  let last = -1;
  let guard = 0;
  while (x < COLS + 1 && guard++ < 40) {
    // occasional vertical hop for a true metro-diagram feel
    const vertical = rand() < 0.14 && last !== 3 && last !== 4;
    let dx: number, dy: number, len: number, idx: number;
    if (vertical) {
      const up = rand() < 0.5;
      idx = up ? 3 : 4;
      dx = 0;
      dy = up ? -1 : 1;
      len = 1 + Math.floor(rand() * 2);
    } else {
      idx = Math.floor(rand() * MOVES.length);
      if (idx === last) idx = (idx + 1 + Math.floor(rand() * 2)) % MOVES.length;
      [dx, dy] = MOVES[idx];
      len = 1 + Math.floor(rand() * 4);
    }
    // keep inside rows 1..ROWS-1; fall back to a straight run
    const maxFit =
      dy === 0 ? len : dy < 0 ? y - 1 : ROWS - 1 - y;
    if (dy !== 0 && maxFit < 1) {
      idx = 0;
      dx = 1;
      dy = 0;
      len = 1 + Math.floor(rand() * 3);
    } else if (dy !== 0) {
      len = Math.min(len, maxFit);
    }
    x += dx * len;
    y += dy * len;
    pts.push([x, y]);
    last = idx;
  }
  return pts;
}

export interface RouteCoverProps {
  /** Seed: the post slug. */
  slug: string;
  tone?: keyof typeof TONES;
  className?: string;
  /** Stroke weight in viewBox units (default 15). */
  weight?: number;
}

export function RouteCover({
  slug,
  tone = "panel",
  className,
  weight = 15,
}: RouteCoverProps) {
  const t = TONES[tone];
  const rand = seededRandom(hashString(`route:${slug}`));

  const primary = LINES.find((l) => l.id === postLineId(slug))!;
  const others = [...LINES.filter((l) => l.id !== primary.id).map((l) => l.color), ACADEMIE.color];
  // deterministic shuffle
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const count = 3 + (rand() < 0.5 ? 1 : 0);
  const colours = [primary.color, ...others.slice(0, count - 1)];

  const routes = colours.map((color) => ({ color, pts: buildRoute(rand) }));

  // terminus: a bend of the primary route, kept inside the frame
  const primaryInside = routes[0].pts.filter(([px, py]) => px >= 4 && px <= COLS - 2 && py >= 1 && py <= ROWS - 1);
  const terminus = primaryInside.length
    ? primaryInside[Math.floor(rand() * primaryInside.length)]
    : null;

  return (
    <svg
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-full w-full", className)}
    >
      <rect width={COLS * CELL} height={ROWS * CELL} fill={t.bg} />
      <g fill="none" strokeLinejoin="round" strokeLinecap="butt">
        {routes.map(({ color, pts }, i) => {
          const d = pts.map(([px, py], k) => `${k ? "L" : "M"}${px * CELL} ${py * CELL}`).join(" ");
          return (
            <g key={i}>
              <path d={d} stroke={t.bg} strokeWidth={weight + 9} />
              <path d={d} stroke={color} strokeWidth={weight} />
            </g>
          );
        })}
      </g>
      <g>
        {routes.map(({ pts }, i) =>
          pts
            .slice(1, -1)
            .filter(([px, py]) => px > 0 && px < COLS && py > 0 && py < ROWS)
            .filter((_, k) => (k + i) % 2 === 0)
            .map(([px, py], k) => (
              <circle
                key={`${i}-${k}`}
                cx={px * CELL}
                cy={py * CELL}
                r={weight * 0.62}
                fill={t.station}
                stroke={t.ring}
                strokeWidth={4}
              />
            )),
        )}
        {terminus ? (
          <g>
            <circle cx={terminus[0] * CELL} cy={terminus[1] * CELL} r={weight * 1.05} fill={t.station} stroke={t.ring} strokeWidth={5} />
            <circle cx={terminus[0] * CELL} cy={terminus[1] * CELL} r={weight * 0.4} fill={primary.color} />
          </g>
        ) : null}
      </g>
    </svg>
  );
}
