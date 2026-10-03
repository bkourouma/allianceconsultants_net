import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Native <details>/<summary> accordion: keyboard + screen-reader semantics
 * for free, works without JS, no layout shift.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="divide-y divide-rule overflow-hidden rounded-lg bg-panel ring-1 ring-rule">
      {items.map((it) => (
        <details key={it.id} className="group" open={it.defaultOpen}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-display text-lg font-semibold tracking-tight text-ink transition-colors hover:bg-enamel [&::-webkit-details-marker]:hidden">
            {it.title}
            <ChevronDown
              aria-hidden
              strokeWidth={1.75}
              className="size-5 shrink-0 text-ink-soft transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="px-5 pb-6 pt-1 text-ink-soft">{it.content}</div>
        </details>
      ))}
    </div>
  );
}
