import { Section } from "@/components/ui/Section";
import type { SolutionComparison } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";

interface ComparisonSectionProps {
  comparison: SolutionComparison;
}

/** « Face à un tableur ou à un logiciel généraliste » : points de comparaison en texte. */
export function ComparisonSection({ comparison }: ComparisonSectionProps) {
  return (
    <Section id="comparaison" bg="white" padding="md" aria-labelledby="comparaison-title">
      <SectionHead
        id="comparaison-title"
        title={comparison.title}
        intro={comparison.intro}
      />
      <ul className="mt-10 border-t-2 border-ink">
        {comparison.points.map((p) => (
          <li
            key={p.label}
            className="grid gap-2 border-b border-rule py-5 sm:py-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10"
          >
            <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.01em] text-ink sm:text-xl">
              {p.label}
            </h3>
            <p className="t-body text-ink-soft">{p.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
