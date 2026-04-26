import Link from "next/link";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Solution } from "@/lib/validators/content";

interface SolutionCardProps {
  solution: Solution;
}

const ICON_MAP: Record<string, string> = {
  document: "📄",
  medical: "💊",
  health: "👁️",
  building: "🏢",
  announcement: "📢",
  school: "🎓",
};

export function SolutionCard({ solution }: SolutionCardProps) {
  const icon = solution.iconKey ? ICON_MAP[solution.iconKey] ?? "⚡" : "⚡";

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">{icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            {solution.category}
          </p>
          <h3 className="text-lg font-bold text-gray-900">{solution.name}</h3>
        </div>
      </div>

      <p className="mb-3 flex-1 text-sm leading-relaxed text-gray-600">{solution.shortDescription}</p>

      <p className="mb-5 text-sm font-medium text-[var(--color-primary-dark)]">
        ✓ {solution.mainBenefit}
      </p>

      <div className="flex items-center gap-3">
        <CTAButton
          intent="demo"
          label="Demander une démo"
          solutionSlug={solution.slug}
          block="solution-card"
          size="sm"
        />
        <Link
          href={`/solutions/${solution.slug}`}
          className="text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
        >
          En savoir plus →
        </Link>
      </div>
    </article>
  );
}
