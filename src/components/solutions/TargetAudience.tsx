import { Section } from "@/components/ui/Section";
import type { TargetAudienceItem } from "@/lib/validators/content";

interface TargetAudienceProps {
  items: TargetAudienceItem[];
  problemsSolved: string[];
}

export function TargetAudience({ items, problemsSolved }: TargetAudienceProps) {
  return (
    <Section bg="white">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
            Pour qui&nbsp;?
          </h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.label} className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">{item.label}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">
            Problèmes adressés
          </h2>
          <ul className="space-y-3">
            {problemsSolved.map((p) => (
              <li key={p} className="flex items-start gap-3 text-gray-700">
                <span aria-hidden="true" className="mt-1 text-[var(--color-primary)]">●</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
