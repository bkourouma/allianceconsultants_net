import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { BlogIndexCard } from "@/components/blog/BlogIndexCard";
import { BlogTagBadge } from "@/components/blog/BlogTagBadge";
import {
  BLOG_PAGE_SIZE,
  listAllPublishedTags,
  listPublishedPosts,
} from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const tags = await listAllPublishedTags().catch(() => []);
  return tags.map((t) => ({ slug: t.slug }));
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
  };
}

export default async function BlogTagPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const tags = await listAllPublishedTags();
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();

  const { items, total } = await listPublishedPosts({ page, tag: tag.slug });
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

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
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 100% 0%, rgba(59,130,246,0.18), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-primary">Accueil</Link>
              </li>
              <li aria-hidden className="text-slate-300">/</li>
              <li>
                <Link href="/blog" className="hover:text-primary">Blog</Link>
              </li>
              <li aria-hidden className="text-slate-300">/</li>
              <li className="font-medium text-slate-700">{tag.label}</li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Tag
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            {tag.label}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {total} article{total > 1 ? "s" : ""} publié{total > 1 ? "s" : ""} sous ce tag.
          </p>

          {tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Autres tags :
              </span>
              <Link
                href="/blog"
                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-primary"
              >
                Tous
              </Link>
              {tags.map((t) => (
                <BlogTagBadge key={t.slug} tag={t} active={t.slug === tag.slug} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-600">Aucun article pour ce tag.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <BlogIndexCard key={p.id} post={p} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination page={page} totalPages={totalPages} tagSlug={tag.slug} />
        ) : null}
      </section>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  tagSlug,
}: {
  page: number;
  totalPages: number;
  tagSlug: string;
}) {
  function buildHref(p: number) {
    return p > 1 ? `/blog/tags/${tagSlug}?page=${p}` : `/blog/tags/${tagSlug}`;
  }
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between text-sm"
    >
      <span className="text-slate-500">
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            rel="prev"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            ← Précédents
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            rel="next"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Suivants →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
