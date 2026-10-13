import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { frTypo } from "@/components/blog/post-utils";
import type { PublishedPostListItem } from "@/lib/blog";
import type { Homepage } from "@/lib/validators/content";

interface GuidesSectionProps {
  guidesSection: NonNullable<Homepage["guidesSection"]>;
  /** Articles réellement publiés (déjà filtrés) : l'ancre du lien est leur titre. */
  posts: Pick<PublishedPostListItem, "slug" | "title" | "excerpt">[];
}

/**
 * « Nos guides et articles récents » : liens vers les articles qui répondent
 * aux questions des visiteurs (scanner, automatisation IA, développement
 * spécifique, archivage). Ancres descriptives = titres des articles.
 */
export function GuidesSection({ guidesSection, posts }: GuidesSectionProps) {
  if (posts.length === 0) return null;
  return (
    <Section bg="white" padding="md" aria-labelledby="guides-title" className="lg:py-24">
      <header className="pb-7 lg:pb-9">
        <h2 id="guides-title" className="t-h2 m-0 text-ink">
          {guidesSection.title}
        </h2>
        {guidesSection.intro ? (
          <p className="t-lead mt-4 max-w-[60ch]">{guidesSection.intro}</p>
        ) : null}
        <p className="m-0 mt-2">
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            Tous les articles
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>
        </p>
      </header>

      <ul className="grid gap-x-10 border-b border-ink/15 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug} className="border-t border-ink/15">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full items-start justify-between gap-5 py-6"
            >
              <span className="min-w-0">
                <span className="block font-display text-xl font-bold leading-snug tracking-[-0.01em] text-ink underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-[var(--accent,currentColor)]">
                  {frTypo(post.title)}
                </span>
                <span className="mt-2 block text-[0.9375rem] leading-relaxed text-ink-soft">
                  {post.excerpt}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                strokeWidth={1.75}
                className="mt-1 size-5 shrink-0 text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
