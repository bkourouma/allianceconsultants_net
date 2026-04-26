import { Section } from "@/components/ui/Section";
import type { FaqEntry } from "@/lib/validators/content";

interface FaqProps {
  entries: FaqEntry[];
}

export function Faq({ entries }: FaqProps) {
  return (
    <Section bg="gray">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {entries.map((entry) => (
            <details
              key={entry.question}
              className="group rounded-xl border border-gray-200 bg-white p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2">
                <span>{entry.question}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 text-[var(--color-primary)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-gray-700">
                {entry.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
