import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { BlogArticleHero } from "@/components/blog/BlogArticleHero";
import { BlogIndexCard } from "@/components/blog/BlogIndexCard";
import {
  getPublishedPostBySlug,
  listRelatedPosts,
} from "@/lib/blog";
import { getSiteSettings } from "@/lib/content";
import {
  buildArticleJsonLd,
  buildBlogBreadcrumbJsonLd,
  buildMetadata,
} from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: "Article introuvable", robots: { index: false, follow: false } };
  }
  const url = `${SITE_URL}/blog/${slug}`;
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const ogImage = post.ogImage ?? post.coverUrl ?? undefined;

  return {
    ...buildMetadata({
      title,
      description,
      ogImage: ogImage ?? undefined,
      siteUrl: url,
    }),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "fr_FR",
      siteName: "Alliance Consultants",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const [related, settings] = await Promise.all([
    listRelatedPosts(post.id, post.tags.map((t) => t.slug), 3),
    getSiteSettings(),
  ]);

  const url = `${SITE_URL}/blog/${slug}`;
  const articleJsonLd = buildArticleJsonLd({
    title: post.title,
    description: post.seoDescription ?? post.excerpt,
    url,
    image: post.ogImage ?? post.coverUrl ?? undefined,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.authorName,
    organizationName: settings.brand.name,
    organizationLogo: new URL(settings.brand.logoUrl, SITE_URL).toString(),
  });
  const breadcrumbJsonLd = buildBlogBreadcrumbJsonLd({
    siteUrl: SITE_URL,
    postTitle: post.title,
    postSlug: post.slug,
  });

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <BlogArticleHero post={post} />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div
          className="prose prose-slate max-w-none prose-headings:scroll-mt-32 prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />

        <aside className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Discutons de votre projet
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Vous voulez approfondir ce sujet pour votre organisation ?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Nos consultants vous accompagnent : diagnostic digital,
            automatisation, formations, intégration SaaS. Échangeons sur votre
            contexte.
          </p>
          <Link
            href={`/contact-demo?intent=contact&fromPage=${encodeURIComponent(`/blog/${slug}`)}&fromBlock=blog-cta`}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Prendre contact
          </Link>
        </aside>
      </article>

      {related.length > 0 ? (
        <section className="bg-slate-50 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Articles connexes
              </h2>
              <Link
                href="/blog"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Tous les articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogIndexCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
