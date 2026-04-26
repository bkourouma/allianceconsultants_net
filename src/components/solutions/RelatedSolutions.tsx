import Link from "next/link";
import { Section } from "@/components/ui/Section";
import type { RelatedSolution, Solution } from "@/lib/validators/content";

interface RelatedSolutionsProps {
  related: RelatedSolution[];
  allSolutions: Solution[];
}

export function RelatedSolutions({ related, allSolutions }: RelatedSolutionsProps) {
  const bySlug = new Map(allSolutions.map((s) => [s.slug, s] as const));

  const items = related
    .map((r) => {
      const target = bySlug.get(r.slug);
      if (!target) return null;
      return { ...r, target };
    })
    .filter((x): x is { slug: string; differentiator: string; target: Solution } => x !== null);

  if (items.length === 0) return null;

  return (
    <Section bg="white">
      <div className="mb-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Solutions associées
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Selon votre besoin, ces solutions de l&apos;écosystème Alliance Consultants
          peuvent mieux vous correspondre.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.slug}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {item.target.category}
            </p>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              <Link
                href={`/solutions/${item.slug}`}
                className="rounded transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                {item.target.name}
              </Link>
            </h3>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-700">
              {item.differentiator}
            </p>
            <Link
              href={`/solutions/${item.slug}`}
              className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
            >
              Découvrir {item.target.name} →
            </Link>
          </article>
        ))}
      </div>
    </Section>
  );
}
