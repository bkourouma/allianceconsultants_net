import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * "Terminus" — closing call-to-action panel. A bundle of strokes bends at 45°
 * and ends in a ringed terminus marker. Pure SVG, no animation.
 */
export function Terminus({
  title,
  children,
  actions,
  colors = ["#1457f5"],
  className,
  titleId,
}: {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  /** Stroke colours (max 6). */
  colors?: string[];
  className?: string;
  titleId?: string;
}) {
  const strokes = colors.slice(0, 6);
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-night text-white",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 640 220"
        className="pointer-events-none absolute -bottom-2 right-0 -z-10 h-auto w-[min(34rem,100%)] opacity-90"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {strokes.map((c, i) => (
          <path
            key={i}
            d={`M-20 ${190 + i * 7} H${330 + i * 2} L${420 + i * 2} ${100 + i * 7} H560`}
            stroke={c}
          />
        ))}
        <circle cx="584" cy={100 + ((strokes.length - 1) * 7) / 2} r="20" fill="#07122b" stroke="#fff" strokeWidth="6" />
        <circle cx="584" cy={100 + ((strokes.length - 1) * 7) / 2} r="6" fill="#fff" />
      </svg>
      <div className="relative px-6 py-12 sm:px-10 md:px-14 md:py-16">
        <h2 id={titleId} className="t-h2 max-w-[18ch] text-white">
          {title}
        </h2>
        {children && (
          <div className="mt-5 max-w-[54ch] text-lg leading-relaxed text-white/85">
            {children}
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>
        <p aria-hidden className="mt-24 text-sm font-bold text-white/70 sm:mt-28">
          Terminus
        </p>
      </div>
    </section>
  );
}
