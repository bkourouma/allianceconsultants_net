import { cn } from "@/lib/utils";

interface StationsProps {
  stations: readonly string[];
  className?: string;
  label?: string;
  /** Kept for backwards compatibility: chips wrap on their own. */
  orientation?: "row" | "column";
}

/**
 * The key modules of a product, as small ruled chips (navy hairline, white
 * stock) printed on the coupon. Pure presentation, no product colour fills.
 */
export function Stations({ stations, className, label = "Modules clés" }: StationsProps) {
  if (stations.length === 0) return null;

  return (
    <ul
      aria-label={label}
      className={cn("m-0 flex list-none flex-wrap gap-x-1.5 gap-y-1.5 p-0", className)}
    >
      {stations.map((s) => (
        <li
          key={s}
          className="border-[1.5px] border-ink bg-panel px-2 py-[0.1875rem] text-[0.75rem] font-semibold leading-tight text-ink"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}
