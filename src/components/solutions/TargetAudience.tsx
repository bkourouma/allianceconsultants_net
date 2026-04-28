import { Section } from "@/components/ui/Section";
import type { TargetAudienceItem } from "@/lib/validators/content";

interface TargetAudienceProps {
  items: TargetAudienceItem[];
  problemsSolved: string[];
}

export function TargetAudience({
  items,
  problemsSolved,
}: TargetAudienceProps) {
  return (
    <Section bg="gray">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pour qui&nbsp;?
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Les organisations qui en tirent le plus de valeur.
          </p>
          <ul className="mt-8 space-y-4">
            {items.map((item) => (
              <li
                key={item.label}
                className="rounded-xl border border-slate-200/70 bg-white p-5 transition hover:border-primary/30 hover:shadow-sm"
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {item.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Problèmes adressés
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Ce que la solution résout concrètement.
          </p>
          <ul className="mt-8 space-y-3">
            {problemsSolved.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary"
                >
                  ✓
                </span>
                <span className="text-base leading-relaxed text-slate-700">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
