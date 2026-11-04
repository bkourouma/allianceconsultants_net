import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { BlogEmptyState } from "@/components/blog/BlogEmptyState";
import { BlogFilterBar } from "@/components/blog/BlogFilterBar";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogPostList } from "@/components/blog/BlogPostList";
import { listAllPublishedTags, listPublishedPosts, BLOG_PAGE_SIZE } from "@/lib/blog";
import { buildBlogBreadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { getReadingMinutes } from "./_reading-times";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  // Les pages paginées se référencent elles-mêmes (pas de canonique vers la page 1).
  const canonical = page > 1 ? `${SITE_URL}/blog?page=${page}` : `${SITE_URL}/blog`;
  return {
    ...buildMetadata({
      title: "Blog Alliance Consultants — IA, automatisation, SaaS",
      description:
        "Articles, retours d'expérience et bonnes pratiques sur la transformation digitale, l'IA, l'automatisation et les solutions SaaS métier en Afrique francophone.",
      siteUrl: `${SITE_URL}/blog`,
    }),
    alternates: {
      canonical,
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
  };
}

interface PageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const tagSlug = params.tag?.trim() || undefined;

  if (tagSlug) {
    const target = page > 1
      ? `/blog/tags/${encodeURIComponent(tagSlug)}?page=${page}`
      : `/blog/tags/${encodeURIComponent(tagSlug)}`;
    redirect(target);
  }

  const [{ items, total }, tags] = await Promise.all([
    listPublishedPosts({ page, tag: tagSlug }),
    listAllPublishedTags(),
  ]);
  const readingMinutes = await getReadingMinutes(items.map((p) => p.id));

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const breadcrumbJsonLd = buildBlogBreadcrumbJsonLd({ siteUrl: SITE_URL });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <header className="wrap pb-8 pt-10 sm:pt-14 lg:pb-10 lg:pt-20">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <h1 className="t-display max-w-[14ch] text-ink">
            Idées et retours d&rsquo;expérience
          </h1>
          <p className="t-lead lg:pb-3">
            Transformation digitale, IA, automatisation, dématérialisation des
            archives, gestion des SaaS métier : ce que nous apprenons sur le
            terrain auprès des organisations africaines.
          </p>
        </div>

        <hr className="tear mt-10" />
        {tags.length > 0 ? (
          <div className="pt-5">
            <BlogFilterBar tags={tags} />
          </div>
        ) : null}
      </header>

      <section aria-label="Articles" className="wrap pb-20 pt-6 sm:pb-28">
        {items.length === 0 ? (
          <BlogEmptyState title="Le premier article arrive bientôt">
            Nous préparons nos premiers retours d&apos;expérience. Le flux RSS vous
            préviendra dès leur publication.
          </BlogEmptyState>
        ) : (
          <BlogPostList
            items={items}
            featureFirst={page === 1}
            readingMinutes={readingMinutes}
          />
        )}

        {totalPages > 1 ? (
          <BlogPagination page={page} totalPages={totalPages} basePath="/blog" />
        ) : null}
      </section>
    </>
  );
}
