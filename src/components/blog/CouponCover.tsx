import { LINES } from "@/lib/network";
import { cn } from "@/lib/utils";
import { hashString, postLineId, seededRandom } from "./post-utils";

/**
 * Authored generative cover: a small spread of coupon fragments (header band,
 * ruled fields, a dashed tear line with notches, a barcode stub, a perforated
 * edge) and one red stamp, laid out deterministically from a slug. Same slug,
 * same cover, always. Pure SVG, no stock imagery, no client JS.
 */

const W = 640;
const H = 400;

const NAVY = "#0f2a5a";
const RULE = "#c3cadb";
const RED = "#d6342a";
const CARBON = "#5b4aa8";

const TONES = {
  navy: { bg: "#0f2a5a", shade: "#07142e", mark: "#ffffff" },
  paper: { bg: "#e3e7f1", shade: "#0f2a5a", mark: "#0f2a5a" },
} as const;

export type CouponCoverTone = keyof typeof TONES;

interface FragmentSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  accent: string;
  perforatedEdge: boolean;
  stubAt: number;
}

function Fragment({
  spec,
  rand,
  bg,
  shade,
}: {
  spec: FragmentSpec;
  rand: () => number;
  bg: string;
  shade: string;
}) {
  const { x, y, w, h, rot, accent, perforatedEdge, stubAt } = spec;
  const tx = Math.round(w * stubAt);
  const stubW = w - tx;

  // ruled fields on the main part
  const fieldMax = tx - 56;
  const fields = [0.62, 0.84, 0.48].map((k) => Math.round(fieldMax * Math.min(1, k + rand() * 0.16)));

  // barcode on the stub
  const bars: { x: number; w: number }[] = [];
  let bx = tx + 16;
  while (bx < w - 20) {
    const bw = 2 + Math.floor(rand() * 4);
    bars.push({ x: bx, w: bw });
    bx += bw + 2 + Math.floor(rand() * 4);
  }

  const perforations = perforatedEdge
    ? Array.from({ length: Math.floor((h - 12) / 18) }, (_, i) => 14 + i * 18)
    : [];

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={0} y={5} width={w} height={h} rx={6} fill={shade} />
      <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={6} fill="#ffffff" stroke={NAVY} strokeWidth={3} />

      {/* header band + product tab */}
      <rect x={3} y={3} width={w - 6} height={30} rx={4} fill={NAVY} />
      <rect x={3} y={18} width={w - 6} height={15} fill={NAVY} />
      <rect x={tx + 2} y={3} width={stubW - 5} height={30} fill={accent} />
      <rect x={18} y={13} width={Math.round(tx * 0.32)} height={10} rx={2} fill="#ffffff" opacity={0.9} />

      {/* ruled fields */}
      <rect x={18} y={52} width={Math.round(fieldMax * 0.9)} height={20} rx={2} fill={NAVY} />
      {fields.map((fw, i) => (
        <rect key={i} x={18} y={88 + i * 18} width={fw} height={7} rx={2} fill={RULE} />
      ))}

      {/* tear line + notches */}
      <line x1={tx} y1={36} x2={tx} y2={h - 4} stroke={NAVY} strokeWidth={2.5} strokeDasharray="6 5" />
      <circle cx={tx} cy={1} r={9} fill={bg} stroke={NAVY} strokeWidth={3} />
      <circle cx={tx} cy={h - 1} r={9} fill={bg} stroke={NAVY} strokeWidth={3} />

      {/* stub: carbon figure block + barcode */}
      <rect x={tx + 16} y={46} width={Math.min(54, stubW - 32)} height={22} rx={2} fill={CARBON} />
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={h - 66} width={b.w} height={44} fill={NAVY} />
      ))}

      {/* perforated edge */}
      {perforations.map((py) => (
        <circle key={py} cx={1} cy={py + 20} r={5} fill={bg} stroke={NAVY} strokeWidth={2.5} />
      ))}
    </g>
  );
}

export interface CouponCoverProps {
  /** Seed: the post slug. */
  slug: string;
  /** "auto" picks navy or paper from the slug. */
  tone?: CouponCoverTone | "auto";
  className?: string;
}

export function CouponCover({ slug, tone = "auto", className }: CouponCoverProps) {
  const seed = hashString(`coupon:${slug}`);
  const rand = seededRandom(seed);
  const resolved: CouponCoverTone = tone === "auto" ? (seed % 2 === 0 ? "navy" : "paper") : tone;
  const t = TONES[resolved];

  const primary = LINES.find((l) => l.id === postLineId(slug))!;
  const others = LINES.filter((l) => l.id !== primary.id).map((l) => l.color);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const sign = rand() < 0.5 ? -1 : 1;

  const back: FragmentSpec = {
    x: -90 + Math.round(rand() * 40),
    y: -40 + Math.round(rand() * 30),
    w: 380,
    h: 220,
    rot: sign * (7 + rand() * 5),
    accent: others[0],
    perforatedEdge: true,
    stubAt: 0.72,
  };
  const mid: FragmentSpec = {
    x: 300 + Math.round(rand() * 50),
    y: 150 + Math.round(rand() * 50),
    w: 360,
    h: 210,
    rot: -sign * (5 + rand() * 6),
    accent: others[1],
    perforatedEdge: false,
    stubAt: 0.66 + rand() * 0.08,
  };
  const main: FragmentSpec = {
    x: 70 + Math.round(rand() * 70),
    y: 80 + Math.round(rand() * 60),
    w: 420,
    h: 240,
    rot: sign * (-3 - rand() * 4),
    accent: primary.color,
    perforatedEdge: false,
    stubAt: 0.7,
  };

  // a long perforation running behind everything
  const tearY = 40 + Math.round(rand() * 320);
  const stamp = {
    cx: 440 + Math.round(rand() * 110),
    cy: 250 + Math.round(rand() * 80),
    rot: -(8 + Math.round(rand() * 12)),
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-full w-full", className)}
    >
      <rect width={W} height={H} fill={t.bg} />
      <line x1={0} y1={tearY} x2={W} y2={tearY} stroke={t.mark} strokeWidth={2} strokeDasharray="7 7" opacity={0.28} />

      <Fragment spec={back} rand={rand} bg={t.bg} shade={t.shade} />
      <Fragment spec={mid} rand={rand} bg={t.bg} shade={t.shade} />
      <Fragment spec={main} rand={rand} bg={t.bg} shade={t.shade} />

      {/* the one rubber stamp */}
      <g transform={`translate(${stamp.cx} ${stamp.cy}) rotate(${stamp.rot})`}>
        <circle r={48} fill="#ffffff" opacity={0.86} />
        <circle r={46} fill="none" stroke={RED} strokeWidth={4} opacity={0.92} />
        <circle r={36} fill="none" stroke={RED} strokeWidth={2} strokeDasharray="3 4" opacity={0.92} />
        <path d="M-15 1 L-4 12 L16 -13" fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} />
      </g>
    </svg>
  );
}
