import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { getLine, lineStyle } from "@/lib/network";
import type { Solution } from "@/lib/validators/content";

interface SolutionCardProps {
  solution: Solution;
}

const NEUTRAL_STYLE = {
  "--accent": "#0f2a5a",
  "--on-accent": "#ffffff",
} as React.CSSProperties;

/**
 * Compact coupon: product-colour index tab, name and sector on white stock,
 * a short pitch, then a dashed tear above the actions (the red demo stub).
 * The homepage uses the richer ledger (components/homepage/solutions); this
 * stays for lists elsewhere.
 */
export function SolutionCard({ solution }: SolutionCardProps) {
  const line = getLine(solution.slug);
  const sector = line?.sector ?? solution.category;

  return (
    <article
      style={line ? lineStyle(line.id) : NEUTRAL_STYLE}
      className="coupon relative mt-3 flex flex-col text-ink"
    >
      <span
        aria-hidden
        className="absolute left-5 top-[calc(-0.75rem-2px)] h-[calc(0.75rem+2px)] w-14 rounded-t-[3px] border-2 border-b-0 border-ink bg-[var(--accent)]"
      />

      <div className="px-4 pb-3 pt-5">
        <h3 className="m-0 break-words font-display text-[1.75rem] font-bold leading-none text-balance">
          {solution.name}
        </h3>
        <p className="t-field m-0 mt-2">{sector}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <p className="m-0 flex-1 text-[0.9375rem] leading-snug text-ink-soft">
          {solution.shortDescription}
        </p>
        <p className="m-0 text-[0.9375rem] font-bold leading-snug">{solution.mainBenefit}</p>
      </div>

      <hr className="tear m-0" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-enamel/60 px-4 py-3">
        <CTAButton
          intent="demo"
          label="Demander une démo"
          solutionSlug={solution.slug}
          block="solution-card"
          size="md"
        />
        <Link
          href={`/solutions/${solution.slug}`}
          className="inline-flex min-h-11 items-center font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink underline decoration-2 underline-offset-[5px] hover:decoration-red"
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
    </article>
  );
}
