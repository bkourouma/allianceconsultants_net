import { cn } from "@/lib/utils";

interface StationsProps {
  stations: readonly string[];
  className?: string;
  label?: string;
  /** "row" = horizontal strip (closed row head), "column" = vertical route (open panel). */
  orientation?: "row" | "column";
}

/**
 * Mini line diagram: a thick stroke running through ringed dots, station names
 * beside them. Stroke colour comes from `--stroke`, set by the parent row
 * (accent when closed, on-accent when the row is a colour field).
 */
export function Stations({
  stations,
  className,
  label = "Modules clés",
  orientation = "row",
}: StationsProps) {
  if (stations.length === 0) return null;

  if (orientation === "column") {
    return (
      <ol aria-label={label} className={cn("relative m-0 grid list-none gap-y-4 p-0", className)}>
        {/* the line itself, behind the dots */}
        <span
          aria-hidden
          className="absolute bottom-3 left-[0.5625rem] top-3 w-1 -translate-x-1/2 rounded-full bg-[var(--stroke,var(--accent))]"
        />
        {stations.map((s) => (
          <li key={s} className="relative flex items-center gap-3.5">
            <span
              aria-hidden
              className="relative z-10 size-[1.125rem] shrink-0 rounded-full border-4 border-[var(--stroke,var(--accent))] bg-panel"
            />
            <span className="font-display text-[1.0625rem] font-bold leading-tight tracking-[-0.01em] text-balance">
              {s}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      aria-label={label}
      className={cn("relative m-0 grid list-none gap-x-2 p-0", className)}
      style={{ gridTemplateColumns: `repeat(${stations.length}, minmax(0, 1fr))` }}
    >
      {/* the line itself, behind the dots */}
      <span
        aria-hidden
        className="absolute left-2 right-0 top-2 h-1 -translate-y-1/2 rounded-full bg-[var(--stroke,var(--accent))]"
      />
      {stations.map((s) => (
        <li key={s} className="relative flex flex-col items-start gap-1.5">
          <span
            aria-hidden
            className="relative z-10 size-4 rounded-full border-[3.5px] border-[var(--stroke,var(--accent))] bg-panel"
          />
          <span className="t-station text-balance !text-[0.75rem] leading-tight">{s}</span>
        </li>
      ))}
    </ol>
  );
}
