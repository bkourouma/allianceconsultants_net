import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleFaq } from "@/components/blog/ArticleFaq";
import { ArticleToc } from "@/components/blog/ArticleToc";
import { BlogArticleHero } from "@/components/blog/BlogArticleHero";
import { BlogIndexCard } from "@/components/blog/BlogIndexCard";
import { BlogTagBadge } from "@/components/blog/BlogTagBadge";
import { BlogTerminus } from "@/components/blog/BlogTerminus";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareActions } from "@/components/blog/ShareActions";
import {
  countWords,
  faqToText,
  postLineId,
  prepareArticle,
  readingMinutesFromWords,
} from "@/components/blog/post-utils";
import {
  getPublishedPostBySlug,
  listRelatedPosts,
} from "@/lib/blog";
import { getSiteSettings } from "@/lib/content";
import { lineStyle } from "@/lib/network";
import {
  buildArticleJsonLd,
  buildBlogBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { getReadingMinutes } from "../_reading-times";

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

const ARTICLE_ID = "article-body";

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
  const relatedMinutes = await getReadingMinutes(related.map((p) => p.id));

  const url = `${SITE_URL}/blog/${slug}`;
  const rawImage = post.ogImage ?? post.coverUrl ?? undefined;
  const wordCount = countWords(post.bodyHtml, faqToText(post.faq));
  const articleJsonLd = buildArticleJsonLd({
    title: post.title,
    description: post.seoDescription ?? post.excerpt,
    url,
    image: rawImage ? new URL(rawImage, SITE_URL).toString() : undefined,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.authorName,
    organizationName: settings.brand.name,
    organizationLogo: new URL(settings.brand.logoUrl, SITE_URL).toString(),
    organizationUrl: new URL("/", SITE_URL).origin,
    wordCount,
    keywords: post.tags.map((t) => t.label),
  });
  const faqJsonLd = post.faq.length > 0 ? buildFaqJsonLd(post.faq) : null;
  const breadcrumbJsonLd = buildBlogBreadcrumbJsonLd({
    siteUrl: SITE_URL,
    postTitle: post.title,
    postSlug: post.slug,
  });

  // bodyHtml is sanitised at write time (lib/sanitize.ts); prepareArticle only
  // adds heading ids / figure wrappers on top and derives the contents list.
  const { html, toc } = prepareArticle(post.bodyHtml);
  if (post.faq.length > 0) {
    toc.push({ id: "questions-frequentes", text: "Questions fréquentes", level: 2 });
  }
  const minutes = readingMinutesFromWords(wordCount);

  return (
    <div style={lineStyle(postLineId(post.slug))}>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <ReadingProgress targetId={ARTICLE_ID} />

      <BlogArticleHero post={post} readingMinutes={minutes} />

      <div className="wrap pb-14 lg:pb-20">
        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,46rem)] lg:justify-center lg:gap-16">
          <aside className="mb-8 lg:sticky lg:top-28 lg:mb-0 lg:self-start">
            <ArticleToc items={toc} />
            <div className="mt-8 hidden lg:block">
              <p className="mb-3 text-sm font-bold text-ink">Partager</p>
              <ShareActions url={url} title={post.title} variant="rail" />
            </div>
          </aside>

          <article aria-label={post.title} className="min-w-0">
            <ArticleBody html={html} id={ARTICLE_ID} />
            <ArticleFaq entries={post.faq} />

            <footer className="mt-12 border-t border-ink/15 pt-6">
              {post.tags.length > 0 ? (
                <ul className="mb-6 flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <li key={t.slug}>
                      <BlogTagBadge tag={t} />
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mb-3 text-sm font-bold text-ink">Partager cet article</p>
              <ShareActions url={url} title={post.title} variant="bar" />
            </footer>
          </article>
        </div>
      </div>

      <div className="wrap pb-16 lg:pb-24">
        <BlogTerminus />
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="wrap pb-20 lg:pb-28">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
            <h2
              id="related-title"
              className="t-h2 text-ink"
            >
              À lire ensuite
            </h2>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-4"
            >
              Tous les articles
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </div>
          <ul className="border-b border-ink/15">
            {related.map((p, i) => (
              <li key={p.id}>
                <BlogIndexCard
                  post={{ ...p, readingMinutes: relatedMinutes[p.id] }}
                  emphasis={i % 2 === 0 ? "lg" : "sm"}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
