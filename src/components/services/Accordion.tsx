import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Native <details>/<summary> accordion drawn as one coupon whose folds are
 * dashed tear lines. Keyboard + screen-reader semantics for free, works
 * without JS, no layout shift.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="coupon overflow-hidden">
      {items.map((it) => (
        <details
          key={it.id}
          className="group border-t-2 border-dashed border-ink first:border-t-0"
          open={it.defaultOpen}
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-display text-xl font-bold leading-tight text-ink transition-colors hover:bg-enamel group-open:bg-[#f6f5fb] md:px-6 [&::-webkit-details-marker]:hidden">
            {it.title}
            <ChevronDown
              aria-hidden
              strokeWidth={2}
              className="size-5 shrink-0 text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="px-5 pb-6 pt-3 text-ink-soft md:px-6">{it.content}</div>
        </details>
      ))}
    </div>
  );
}
