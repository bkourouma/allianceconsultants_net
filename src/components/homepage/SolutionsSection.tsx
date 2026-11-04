import { Lineup } from "@/components/homepage/solutions/Lineup";
import { Reveal } from "@/components/fx/Reveal";
import type { Homepage, Solution } from "@/lib/validators/content";

interface SolutionsSectionProps {
  sectionMeta: Homepage["solutionsSection"];
  solutions: Solution[];
  /** Anchor id for in-page links. */
  id?: string;
}

/**
 * "Les six coupons" — the offer as a ledger of service coupons on the paper
 * ground. One coupon per solution (content-driven); opening one folds it out to
 * an illustrative product preview.
 */
export function SolutionsSection({
  sectionMeta,
  solutions,
  id = "solutions",
}: SolutionsSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby="solutions-title"
      className="scroll-mt-16 bg-enamel text-ink"
    >
      <div className="wrap pb-20 pt-16 lg:pb-32 lg:pt-24">
        <Reveal className="max-w-3xl">
          <h2 id="solutions-title" className="t-h2 m-0 text-ink">
            {sectionMeta.title}
          </h2>
          {sectionMeta.intro && (
            <p className="t-lead mb-0 mt-5 lg:mt-6">{sectionMeta.intro}</p>
          )}
        </Reveal>

        <div className="mt-14 lg:mt-20">
          <Lineup solutions={solutions} />
        </div>
      </div>
    </section>
  );
}
