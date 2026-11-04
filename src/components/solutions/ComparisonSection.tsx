import type { SolutionComparison } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";

interface ComparisonSectionProps {
  comparison: SolutionComparison;
}

/** « Face à un tableur ou à un logiciel généraliste » : points de comparaison en texte. */
export function ComparisonSection({ comparison }: ComparisonSectionProps) {
  return (
    <section
      id="comparaison"
      aria-labelledby="comparaison-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap">
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
              <h3 className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
                {p.label}
              </h3>
              <p className="t-body text-ink-soft">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
