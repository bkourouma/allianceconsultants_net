import { LINES, lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
import { linesForService } from "./serviceData";

interface ProductChipsProps {
  /** Service slug: the mapping lives in serviceData.ts. */
  slug: string;
  className?: string;
}

/** « Se connecte à » — small product tabs, coloured per product. */
export function ProductChips({ slug, className }: ProductChipsProps) {
  const ids = linesForService(slug);
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <span className="t-field text-[0.75rem]!">Se connecte à</span>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Produits connectés">
        {ids.map((id) => {
          const line = LINES.find((l) => l.id === id);
          if (!line) return null;
          return (
            <li
              key={id}
              style={lineStyle(id)}
              className="inline-flex h-6 items-center rounded-[2px] bg-[var(--accent)] px-2 font-display text-[0.8125rem] font-bold leading-none tracking-[0.04em] text-[var(--on-accent)]"
            >
              {line.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
