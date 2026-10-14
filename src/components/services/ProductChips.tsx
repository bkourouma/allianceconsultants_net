import Link from "next/link";
import { getLine, lineStyle, type LineId } from "@/lib/network";
import { cn } from "@/lib/utils";

const CHIP =
  "inline-flex min-h-8 items-center rounded-[3px] bg-[var(--accent)] px-2.5 font-display text-[0.9375rem] font-bold uppercase leading-none tracking-[0.05em] text-[var(--on-accent)]";

/**
 * Small product colour tabs. With `link`, each chip leads to the product
 * page (44px hit area through padding on the wrapper link).
 */
export function ProductChips({
  ids,
  link = false,
  label = "Solutions associées",
  className,
}: {
  ids: LineId[];
  link?: boolean;
  label?: string;
  className?: string;
}) {
  const lines = ids.flatMap((id) => {
    const l = getLine(id);
    return l ? [l] : [];
  });
  if (lines.length === 0) return null;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-x-2 gap-y-2", className)}>
      {lines.map((l) => (
        <li key={l.id} style={lineStyle(l.id)}>
          {link ? (
            <Link
              href={`/solutions/${l.slug}`}
              className={cn(
                CHIP,
                "min-h-11 px-3.5 text-base transition-transform duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              )}
            >
              {l.name}
            </Link>
          ) : (
            <span className={CHIP}>{l.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
