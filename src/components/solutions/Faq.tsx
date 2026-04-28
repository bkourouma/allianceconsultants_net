import { Section } from "@/components/ui/Section";
import type { FaqEntry } from "@/lib/validators/content";

interface FaqProps {
  entries: FaqEntry[];
}

export function Faq({ entries }: FaqProps) {
  return (
    <Section bg="gray">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Questions fréquentes
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Tout ce qu&apos;il faut savoir
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {entries.map((entry) => (
          <details
            key={entry.question}
            className="group rounded-2xl border border-slate-200/70 bg-white p-5 transition open:shadow-md sm:p-6"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md text-base font-semibold text-slate-900 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-lg">
              <span>{entry.question}</span>
              <span
                aria-hidden="true"
                className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-4 text-base leading-relaxed text-slate-600">
              {entry.answer}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
