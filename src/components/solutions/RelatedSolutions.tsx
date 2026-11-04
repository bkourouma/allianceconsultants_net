import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RelatedSolution, Solution } from "@/lib/validators/content";
import { getLine, lineStyle } from "@/lib/network";
import { CouponBand } from "./CouponBand";
import { couponNo } from "./couponMeta";
import s from "./Solutions.module.css";
import { cn } from "@/lib/utils";

interface RelatedSolutionsProps {
  related: RelatedSolution[];
  allSolutions: Solution[];
  /** Slug of the page being viewed (kept for callers; the sister is relatedSolutions[0]). */
  currentSlug?: string;
}

/**
 * « Produit voisin » is relatedSolutions[0] (validated by
 * scripts/validate-content.ts for the sister pairs). It is drawn as a small
 * coupon with its own accent chip; any further related products are ruled rows.
 */
export function RelatedSolutions({
  related,
  allSolutions,
}: RelatedSolutionsProps) {
  const bySlug = new Map(allSolutions.map((x) => [x.slug, x] as const));

  const items = related
    .map((r) => {
      const target = bySlug.get(r.slug);
      return target ? { ...r, target } : null;
    })
    .filter(
      (x): x is { slug: string; differentiator: string; target: Solution } =>
        x !== null,
    );

  if (items.length === 0) return null;

  const [sister, ...others] = items;
  const sisterSector = getLine(sister.slug)?.sector ?? sister.target.category;

  return (
    <section
      id="solutions-associees"
      aria-labelledby="related-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap">
        <h2 id="related-title" className="t-h2 text-ink">
          Produit voisin
        </h2>

        <div
          style={lineStyle(sister.slug)}
          className={cn("coupon mt-8", s.lift)}
        >
          <CouponBand
            no={couponNo(sister.slug) || "•"}
            title={sister.target.name}
            chip={sisterSector}
          />
          <div className="grid lg:grid-cols-[minmax(0,1fr)_17.5rem]">
            <div className="p-6 sm:p-8">
              <p className="t-lead !max-w-[56ch] !text-ink">
                {sister.differentiator}
              </p>
            </div>
            <div className="flex items-center border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 lg:rounded-br-[2px] lg:border-l-2 lg:border-t-0">
              <Link
                href={`/solutions/${sister.slug}`}
                className="group/link inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[3px] bg-ink px-4 py-2 text-center font-display text-[1.0625rem] font-bold uppercase leading-tight tracking-[0.06em] text-white no-underline transition-colors hover:bg-night-2"
              >
                Voir {sister.target.name}
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/link:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </Link>
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <ul className="mt-10 border-t-2 border-ink">
            {others.map((item) => (
              <li
                key={item.slug}
                style={lineStyle(item.slug)}
                className="grid gap-x-5 gap-y-2 border-b border-rule py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
              >
                <span
                  aria-hidden
                  className="size-3.5 rounded-[2px] bg-[var(--accent)] ring-1 ring-ink sm:mt-1.5 sm:self-start"
                />
                <div>
                  <h3 className="font-display text-xl font-bold leading-snug text-ink">
                    {item.target.name}
                  </h3>
                  <p className="t-body mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {item.differentiator}
                  </p>
                </div>
                <Link
                  href={`/solutions/${item.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  Découvrir {item.target.name}
                  <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
