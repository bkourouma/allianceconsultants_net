import { Lineup } from "@/components/homepage/solutions/Lineup";
import { getLine } from "@/lib/network";
import type { Homepage, Solution } from "@/lib/validators/content";

interface SolutionsSectionProps {
  sectionMeta: Homepage["solutionsSection"];
  solutions: Solution[];
  /** Anchor id for in-page links. */
  id?: string;
}

/* ── The bundle: six parallel strokes arrive from the right edge, bend at 45°
   and drop vertically into the first row of the lineup. ───────────────────── */
const STROKE = 6;
const GAP = 10; // centre-to-centre
/** Part of the graphic that sits inside the ink band. */
const IN_BAND = 150;
/** Part that falls onto the enamel, down to the first row. */
const BELOW_BAND = 56;
const HEIGHT = IN_BAND + BELOW_BAND;
const REACH = 3200; // runs well past the right edge; the band clips it
const Y_REF = 74; // y of the horizontal run's centre line
const TURN = 64; // 45° leg length

type Pt = [number, number];

/** Offset a polyline by `d` along its left-hand normal, mitring the joints. */
function offsetPolyline(pts: Pt[], d: number): Pt[] {
  const segs = pts.slice(0, -1).map((p, i) => {
    const q = pts[i + 1];
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const u: Pt = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
    const n: Pt = [u[1], -u[0]];
    return { a: [p[0] + n[0] * d, p[1] + n[1] * d] as Pt, u };
  });
  const out: Pt[] = [segs[0].a];
  for (let i = 0; i < segs.length - 1; i++) {
    const s1 = segs[i];
    const s2 = segs[i + 1];
    const det = s1.u[0] * -s2.u[1] + s2.u[0] * s1.u[1];
    const t = ((s2.a[0] - s1.a[0]) * -s2.u[1] + s2.u[0] * (s2.a[1] - s1.a[1])) / det;
    out.push([s1.a[0] + s1.u[0] * t, s1.a[1] + s1.u[1] * t]);
  }
  const last = segs[segs.length - 1];
  out.push([pts[pts.length - 1][0] + (last.a[0] - pts[pts.length - 2][0]), HEIGHT]);
  return out;
}

const REFERENCE: Pt[] = [
  [REACH, Y_REF],
  [TURN, Y_REF],
  [0, Y_REF + TURN],
  [0, HEIGHT],
];

function buildPath(index: number, count: number): string {
  const d = (index - (count - 1) / 2) * GAP;
  const pts = offsetPolyline(REFERENCE, d);
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
}

/**
 * "Les six lignes" — a full-bleed ink band carries the heading and the bundle
 * of six line strokes, which then feed the lineup of departure-board rows.
 * One row per solution (content-driven), one open at a time; the open row
 * becomes a full colour field with a live, illustrative product preview.
 */
export function SolutionsSection({
  sectionMeta,
  solutions,
  id = "solutions",
}: SolutionsSectionProps) {
  const colours = solutions.map((s) => getLine(s.slug)?.color ?? "#0b1b3a");

  return (
    <section
      id={id}
      aria-labelledby="solutions-title"
      className="scroll-mt-16 bg-enamel text-ink"
    >
      {/* Ink band: heading + lead, strokes run along its foot. */}
      <div className="relative overflow-x-clip bg-ink text-white">
        <div className="wrap pb-36 pt-14 md:pt-16 lg:pt-20">
          <h2 id="solutions-title" className="t-display m-0 text-white">
            {sectionMeta.title}
          </h2>
          {sectionMeta.intro && (
            <p className="t-lead mb-0 mt-5 max-w-[52ch] !text-white/80 lg:mt-6">
              {sectionMeta.intro}
            </p>
          )}
        </div>

        <div aria-hidden className="wrap pointer-events-none absolute inset-x-0 bottom-0 h-0">
          <div className="relative h-0">
            <svg
              width="1"
              height={HEIGHT}
              viewBox={`0 0 1 ${HEIGHT}`}
              overflow="visible"
              className="absolute left-[22%] z-10 md:left-[40%] lg:left-[62%]"
              style={{ top: -IN_BAND }}
            >
              {colours.map((c, i) => (
                <path
                  key={i}
                  d={buildPath(i, colours.length)}
                  fill="none"
                  stroke={c}
                  strokeWidth={STROKE}
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="wrap pb-16 pt-14 lg:pb-28">
        <Lineup solutions={solutions} />
      </div>
    </section>
  );
}
