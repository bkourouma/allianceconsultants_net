import { Plus } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { FaqEntry } from "@/lib/validators/content";

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
    <Section id="faq" bg="gray" padding="md" aria-labelledby="faq-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <h2 id="faq-title" className="t-h2 max-w-[12ch] text-ink lg:sticky lg:top-40 lg:self-start">
          Questions fréquentes
        </h2>
        <div className="border-t-2 border-ink">
          {entries.map((entry) => (
            <details
              key={entry.question}
              className="group border-b border-rule"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-bold leading-snug tracking-[-0.01em] text-ink">
                  {entry.question}
                </span>
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45"
                >
                  <Plus className="size-5" strokeWidth={2.25} />
                </span>
              </summary>
              <p className="t-body pb-6 pr-12 text-[1.0625rem] leading-relaxed text-ink-soft">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
