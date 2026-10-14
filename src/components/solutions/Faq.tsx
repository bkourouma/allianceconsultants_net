import { Plus } from "lucide-react";
import type { FaqEntry } from "@/lib/validators/content";
import s from "./Solutions.module.css";

interface FaqProps {
  entries: FaqEntry[];
}

/**
 * Accordion built on native <details>/<summary>: keyboard operable, announces
 * expanded state, works without JS, and the answers stay in the DOM.
 * JSON-LD for these entries is emitted by the page.
 */
export function Faq({ entries }: FaqProps) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="pb-16 lg:pb-24">
      <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <h2
          id="faq-title"
          className="t-h2 text-ink lg:sticky lg:top-[calc(var(--site-header-h,4rem)+4.5rem)] lg:self-start"
        >
          Questions fréquentes
        </h2>
        <div className="coupon">
          {entries.map((entry, i) => (
            <details
              key={entry.question}
              className={
                i > 0 ? "group border-t-2 border-dashed border-ink" : "group"
              }
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 marker:hidden sm:px-8 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-xl font-bold leading-snug text-ink">
                  {entry.question}
                </span>
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-[3px] bg-ink text-white transition-[transform,background-color] duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45 group-open:bg-red"
                >
                  <Plus className="size-5" strokeWidth={2.25} />
                </span>
              </summary>
              <p
                className={`t-body px-6 pb-6 text-[1.0625rem] leading-relaxed text-ink-soft sm:px-8 sm:pr-20 ${s.faqBody}`}
              >
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
