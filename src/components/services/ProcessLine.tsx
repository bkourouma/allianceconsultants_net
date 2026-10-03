import { cn } from "@/lib/utils";

/**
 * Decorative-but-semantic line diagram: an ordered list whose stations sit
 * on a bundle of parallel strokes (the colours of the connected lines).
 * Horizontal from md up, vertical on phones.
 */
export function ProcessLine({
  steps,
  colors,
  className,
}: {
  steps: string[];
  /** Stroke colours (max 6). Falls back to white. */
  colors: string[];
  className?: string;
}) {
  const strokes = (colors.length ? colors : ["#ffffff"]).slice(0, 6);
  const bw = strokes.length * 6 - 2;
  return (
    <div
      className={cn("relative", className)}
      style={{ "--bw": `${bw}px` } as React.CSSProperties}
    >
      <span
        aria-hidden
        className="absolute bottom-3 left-[calc(12px-var(--bw)/2)] top-3 flex gap-[2px] md:bottom-auto md:left-3 md:right-0 md:top-[calc(12px-var(--bw)/2)] md:flex-col"
      >
        {strokes.map((c, i) => (
          <span
            key={i}
            className="w-1 rounded-full md:h-1 md:w-full"
            style={{ background: c }}
          />
        ))}
      </span>
      <ol className="relative grid gap-7 md:auto-cols-fr md:grid-flow-col md:gap-6">
        {steps.map((s) => (
          <li key={s} className="relative pl-12 md:pl-0 md:pt-11">
            <span
              aria-hidden
              className="absolute left-0 top-0 size-6 rounded-full border-[5px] border-night bg-white ring-2 ring-white"
            />
            <span className="block font-display text-lg font-semibold leading-snug text-white md:pr-4">
              {s}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
