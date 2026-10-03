import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { getLine, lineStyle } from "@/lib/network";
import type { Solution } from "@/lib/validators/content";

interface SolutionCardProps {
  solution: Solution;
}

const NEUTRAL_STYLE = {
  "--accent": "#0b1b3a",
  "--on-accent": "#ffffff",
} as React.CSSProperties;

/**
 * Compact line card: a colour band with the product roundel + name, then a
 * short pitch and the two actions. The homepage uses the richer lineup
 * (components/homepage/solutions); this stays for lists elsewhere.
 */
export function SolutionCard({ solution }: SolutionCardProps) {
  const line = getLine(solution.slug);
  const sector = line?.sector ?? solution.category;

  return (
    <article
      style={line ? lineStyle(line.id) : NEUTRAL_STYLE}
      className="flex flex-col overflow-hidden rounded-lg bg-panel text-ink shadow-[0_1px_0_var(--color-rule)]"
    >
      <div className="flex items-center gap-3 bg-[var(--accent)] px-4 py-4 text-[var(--on-accent)]">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--on-accent)] font-display text-lg font-extrabold leading-none text-[var(--accent)]"
        >
          {solution.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <h3 className="m-0 break-words font-display text-2xl font-extrabold leading-none tracking-[-0.03em] text-balance">
            {solution.name}
          </h3>
          <p className="m-0 mt-1 text-[0.8125rem] font-semibold leading-tight">{sector}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="m-0 flex-1 text-[0.9375rem] leading-snug text-ink-soft">
          {solution.shortDescription}
        </p>
        <p className="m-0 text-[0.9375rem] font-bold leading-snug">{solution.mainBenefit}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-4">
          <CTAButton
            intent="demo"
            label="Demander une démo"
            solutionSlug={solution.slug}
            block="solution-card"
            size="sm"
          />
          <Link
            href={`/solutions/${solution.slug}`}
            className="inline-flex min-h-11 items-center text-sm font-bold text-ink underline decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
          >
            En savoir plus
            <span className="sr-only"> sur {solution.name}</span>
          </Link>
          {solution.externalUrl && (
            <a
              href={solution.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Site du produit
              <ExternalLink aria-hidden className="size-3.5" strokeWidth={2} />
              <span className="sr-only"> (ouvre le site du produit dans un nouvel onglet)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
