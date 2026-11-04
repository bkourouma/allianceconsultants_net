import { cn } from "@/lib/utils";
import { Reveal } from "@/components/fx/Reveal";
import fx from "./fx.module.css";

/**
 * A perforated checklist: each item is a row of one coupon, separated by
 * dashed tear lines with punched notches. The red ticks draw themselves in
 * once the sheet scrolls into view (static ticks without JS / with
 * prefers-reduced-motion). Items are restated from content, never invented.
 */
export function Checklist({
  items,
  caption,
  label,
  className,
}: {
  items: string[];
  /** Mono field caption printed at the head of the sheet. */
  caption: string;
  /** Accessible name of the list. */
  label: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <div className={cn("coupon", fx.sheet)}>
        <p className="t-field border-b-2 border-ink bg-[#f6f5fb] px-5 py-3 md:px-7">
          {caption}
        </p>
        <ol aria-label={label}>
          {items.map((text, i) => (
            <li
              key={text}
              className={cn(
                fx.row,
                "flex items-start gap-4 px-5 py-4 md:gap-5 md:px-7 md:py-5",
              )}
              style={{ "--i": i } as React.CSSProperties}
            >
              <span
                aria-hidden
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[3px] border-2 border-ink bg-white"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none">
                  <path
                    d="M4 12.5l5 5L20 6.5"
                    className={fx.tick}
                    stroke="var(--color-red)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-display text-[1.375rem] font-bold leading-tight text-ink md:text-2xl">
                {text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
