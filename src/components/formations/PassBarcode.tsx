import { cn } from "@/lib/utils";

/** Deterministic bar widths (1-3 units) from a seed string. */
function bars(seed: string, count = 30): number[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    out.push((h % 3) + 1);
  }
  return out;
}

/**
 * Decorative access-pass barcode: authored SVG, hidden from assistive tech.
 * Inherits `currentColor`.
 */
export function PassBarcode({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const widths = bars(seed);
  let x = 0;
  const rects = widths.map((w, i) => {
    const r = <rect key={i} x={x} y={0} width={w} height={20} />;
    x += w + 1.5 + (i % 4 === 0 ? 0.5 : 0);
    return r;
  });
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${Math.ceil(x)} 20`}
      preserveAspectRatio="none"
      className={cn("h-6 w-24", className)}
      fill="currentColor"
    >
      {rects}
    </svg>
  );
}
