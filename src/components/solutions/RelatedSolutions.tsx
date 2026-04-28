import Link from "next/link";
import { Section } from "@/components/ui/Section";
import type { RelatedSolution, Solution } from "@/lib/validators/content";

interface RelatedSolutionsProps {
  related: RelatedSolution[];
  allSolutions: Solution[];
}

export function RelatedSolutions({
  related,
  allSolutions,
}: RelatedSolutionsProps) {
  const bySlug = new Map(allSolutions.map((s) => [s.slug, s] as const));

  const items = related
    .map((r) => {
      const target = bySlug.get(r.slug);
      if (!target) return null;
      return { ...r, target };
    })
    .filter(
      (x): x is { slug: string; differentiator: string; target: Solution } =>
        x !== null,
    );

  if (items.length === 0) return null;

  return (
    <Section bg="white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Écosystème
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Solutions associées
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Selon votre besoin, ces solutions de l&apos;écosystème Alliance
          Consultants peuvent mieux vous correspondre.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.slug}
            className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg lg:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {item.target.category}
            </p>
            <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900">
              {item.target.name}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {item.differentiator}
            </p>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <Link
                href={`/solutions/${item.slug}`}
                className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
              >
                Découvrir {item.target.name} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
