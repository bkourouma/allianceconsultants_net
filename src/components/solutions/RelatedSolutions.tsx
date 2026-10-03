import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { RelatedSolution, Solution } from "@/lib/validators/content";
import { lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
import { glyphForName } from "@/components/services/serviceMap";
import s from "./Solutions.module.css";

interface RelatedSolutionsProps {
  related: RelatedSolution[];
  allSolutions: Solution[];
  /** Slug of the page being viewed; enables the "Ligne voisine" pairing. */
  currentSlug?: string;
}

/** Sister lines (validated by scripts/validate-content.ts: relatedSolutions[0]). */
const SISTER: Record<string, string> = {
  medicpro: "cliniquepro",
  cliniquepro: "medicpro",
  "immotopia-cloud": "annonces-web",
  "annonces-web": "immotopia-cloud",
};

function Roundel({
  name,
  inverse,
  className,
}: {
  name: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-extrabold",
        inverse
          ? "bg-[var(--on-accent)] text-[var(--accent)]"
          : "bg-[var(--accent)] text-[var(--on-accent)]",
        className,
      )}
    >
      {glyphForName(name)}
    </span>
  );
}

export function RelatedSolutions({
  related,
  allSolutions,
  currentSlug,
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

  const sisterSlug = currentSlug ? SISTER[currentSlug] : undefined;
  const sister = sisterSlug ? items.find((i) => i.slug === sisterSlug) : undefined;
  const others = items.filter((i) => i !== sister);

  return (
    <Section
      id="solutions-associees"
      bg="gray"
      padding="md"
      aria-labelledby="related-title"
    >
      <h2 id="related-title" className="t-h2 max-w-[20ch] text-ink">
        {sister ? "Ligne voisine" : "Changer de ligne"}
      </h2>

      {sister && (
        <div
          style={lineStyle(sister.slug)}
          className={cn(
            "mt-8 grid items-center gap-6 rounded-md bg-[var(--accent)] p-6 text-[var(--on-accent)] sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:gap-10 lg:p-10",
            s.focusOnAccent,
          )}
        >
          <Roundel
            inverse
            name={sister.target.name}
            className="size-16 text-3xl lg:size-24 lg:text-5xl"
          />
          <div>
            <h3 className="t-h3">{sister.target.name}</h3>
            <p className="t-body mt-3 text-[1.0625rem] leading-relaxed">
              {sister.differentiator}
            </p>
          </div>
          <Link
            href={`/solutions/${sister.slug}`}
            className="group/link inline-flex min-h-12 items-center gap-3 rounded-full bg-ink py-1.5 pl-6 pr-1.5 text-base font-bold text-white no-underline transition-colors hover:bg-night-2"
          >
            Voir la ligne {sister.target.name}
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:translate-x-0.5"
            >
              <ArrowRight className="size-4" strokeWidth={2} />
            </span>
          </Link>
        </div>
      )}

      {others.length > 0 && (
        <ul className={cn("border-t-2 border-ink", sister ? "mt-10" : "mt-8")}>
          {others.map((item) => (
            <li
              key={item.slug}
              style={lineStyle(item.slug)}
              className="grid gap-x-5 gap-y-2 border-b border-rule py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <Roundel
                name={item.target.name}
                className="size-11 text-lg"
              />
              <div>
                <h3 className="font-display text-lg font-bold leading-snug text-ink">
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
    </Section>
  );
}
