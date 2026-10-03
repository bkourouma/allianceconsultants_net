import { cn } from "@/lib/utils";

interface StationStripProps {
  labels: string[];
  /** "field" = drawn on a full line-coloured field; "plain" = on enamel/white. */
  tone?: "field" | "plain";
  className?: string;
}

/**
 * Decorative line diagram: stations on a thick line. Horizontal from md up,
 * vertical (line on the left) on phones. Colours come from the ambient
 * --accent / --on-accent so it can sit inside any `.line-*` scope.
 */
export function StationStrip({
  labels,
  tone = "plain",
  className,
}: StationStripProps) {
  const field = tone === "field";
  return (
    <ol className={cn("grid md:grid-flow-col md:auto-cols-fr", className)}>
      {labels.map((label, i) => {
        const last = i === labels.length - 1;
        return (
          <li
            key={`${label}-${i}`}
            className="relative pb-7 pl-10 last:pb-0 md:pb-0 md:pl-0 md:pr-5 md:pt-11"
          >
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[9px] top-3 h-full w-1.5 md:left-3 md:top-[9px] md:h-1.5 md:w-full",
                  field ? "bg-[var(--on-accent)]" : "bg-[var(--accent)]",
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-0 size-6 rounded-full border-[5px]",
                field
                  ? "border-[var(--on-accent)] bg-[var(--accent)]"
                  : "border-[var(--accent)] bg-panel",
              )}
            />
            <span className="block text-[0.9375rem] font-semibold leading-snug">
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
