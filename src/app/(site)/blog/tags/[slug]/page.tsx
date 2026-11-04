import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { BlogBreadcrumb } from "@/components/blog/BlogBreadcrumb";
import { BlogEmptyState } from "@/components/blog/BlogEmptyState";
import { BlogFilterBar } from "@/components/blog/BlogFilterBar";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogPostList } from "@/components/blog/BlogPostList";
import { tagLine } from "@/components/blog/post-utils";
import {
  BLOG_PAGE_SIZE,
  listAllPublishedTags,
  listPublishedPosts,
} from "@/lib/blog";
import { lineStyle } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";
import { getReadingMinutes } from "../../_reading-times";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

/**
 * Page rendue À LA REQUÊTE (comme /blog), jamais pré-générée ni mise en cache ISR.
 *
 * La pagination passe par `?page=` : la page lit donc `searchParams`, une API
 * dynamique. Combinée à `generateStaticParams` (+ `revalidate`), elle faisait
 * échouer CHAQUE requête en production avec `DYNAMIC_SERVER_USAGE` (HTTP 500) :
 * l'image Docker est construite sans base de données, `generateStaticParams`
 * renvoyait [] et la route devenait SSG/ISR, ce qui est incompatible avec la
 * lecture de `searchParams` au rendu. Ne PAS réintroduire `generateStaticParams`
 * ni `revalidate` ici tant que la pagination dépend de `?page=`.
 */
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tags = await listAllPublishedTags().catch(() => []);
  const tag = tags.find((t) => t.slug === slug);
  const url = `${SITE_URL}/blog/tags/${slug}`;

  if (!tag) {
    return {
      ...buildMetadata({
        title: "Tag introuvable — Blog Alliance Consultants",
        description: "Ce tag n'existe pas ou n'a aucun article publié.",
        siteUrl: url,
      }),
      robots: { index: false, follow: false },
    };
  }

  return {
    ...buildMetadata({
      title: `${tag.label} — Articles | Blog Alliance Consultants`,
      description: `Articles classés sous « ${tag.label} » : retours d'expérience, méthodes et bonnes pratiques sur la transformation digitale en Afrique francophone.`,
      siteUrl: url,
    }),
    alternates: {
      canonical: url,
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    // Pages de tag courtes (quelques articles, pagination) : contenu faible.
    // Elles restent explorables pour le maillage vers les articles, sans être indexées.
    robots: { index: false, follow: true },
  };
}

export default async function BlogTagPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const tags = await listAllPublishedTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();

  const { items, total } = await listPublishedPosts({ page, tag: tag.slug });
  const readingMinutes = await getReadingMinutes(items.map((p) => p.id));
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const line = tagLine(tag.slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: tag.label,
        item: `${SITE_URL}/blog/tags/${tag.slug}`,
      },
    ],
  };

  return (
    <div style={lineStyle(line.id)}>
      <JsonLd data={breadcrumbJsonLd} />

      <header className="wrap pb-8 pt-6 sm:pt-10 lg:pb-12">
        <BlogBreadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: tag.label },
          ]}
        />

        <div className="mt-8 flex items-start gap-4 sm:gap-6">
          <span
            aria-hidden
            className="mt-1 grid size-12 shrink-0 place-items-center rounded-full font-display text-xl font-extrabold sm:size-16 sm:text-2xl lg:size-20 lg:text-3xl"
            style={{ background: line.color, color: line.onColor }}
          >
            {tag.label.trim().charAt(0).toUpperCase() || "#"}
          </span>
          <div className="min-w-0">
            <h1 className="t-display text-ink">{tag.label}</h1>
            <p className="t-lead t-num mt-4">
              {total} article{total > 1 ? "s" : ""} publié{total > 1 ? "s" : ""} sous ce tag.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-ink/15 pt-6">
          <BlogFilterBar tags={tags} activeSlug={tag.slug} />
        </div>
      </header>

      <section aria-label="Articles" className="wrap pb-16 pt-2 sm:pb-24">
        {items.length === 0 ? (
          <BlogEmptyState title="Aucun article pour ce tag" showRss={false} backToAll />
        ) : (
          <BlogPostList
            items={items}
            featureFirst={page === 1}
            readingMinutes={readingMinutes}
          />
        )}

        {totalPages > 1 ? (
          <BlogPagination
            page={page}
            totalPages={totalPages}
            basePath={`/blog/tags/${tag.slug}`}
          />
        ) : null}
      </section>
    </div>
  );
}
