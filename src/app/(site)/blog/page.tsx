import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { BlogIndexCard } from "@/components/blog/BlogIndexCard";
import { BlogTagBadge } from "@/components/blog/BlogTagBadge";
import { listAllPublishedTags, listPublishedPosts, BLOG_PAGE_SIZE } from "@/lib/blog";
import { buildBlogBreadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Blog Alliance Consultants — IA, automatisation, SaaS",
      description:
        "Articles, retours d'expérience et bonnes pratiques sur la transformation digitale, l'IA, l'automatisation et les solutions SaaS métier en Afrique francophone.",
      siteUrl: `${SITE_URL}/blog`,
    }),
    alternates: {
      canonical: `${SITE_URL}/blog`,
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

  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
  const breadcrumbJsonLd = buildBlogBreadcrumbJsonLd({ siteUrl: SITE_URL });

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Blog Alliance
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            Idées et retours d&apos;expérience
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Transformation digitale, IA, automatisation, dématérialisation des
            archives, gestion des SaaS métier : ce que nous apprenons sur le
            terrain auprès des organisations africaines.
          </p>

          {tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Filtrer :
              </span>
              <Link
                href="/blog"
                className={
                  !tagSlug
                    ? "inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                    : "inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-primary"
                }
              >
                Tous
              </Link>
              {tags.map((t) => (
                <BlogTagBadge
                  key={t.slug}
                  tag={t}
                  active={tagSlug === t.slug}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-600">
              Aucun article publié pour le moment. Revenez bientôt !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <BlogIndexCard key={p.id} post={p} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination page={page} totalPages={totalPages} tag={tagSlug} />
        ) : null}
      </section>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  tag,
}: {
  page: number;
  totalPages: number;
  tag?: string;
}) {
  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (tag) sp.set("tag", tag);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
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
