import { prisma } from "@/lib/prisma";
import { parsePostFaq, type PostFaqEntry } from "@/lib/blog-faq";

export const BLOG_PAGE_SIZE = 12;

export interface BlogListOptions {
  page?: number;
  pageSize?: number;
  tag?: string;
}

export interface PublishedPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  publishedAt: Date;
  authorName: string | null;
  tags: { slug: string; label: string }[];
}

export interface PublishedPostDetail extends PublishedPostListItem {
  bodyHtml: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  /** Questions fréquentes déclarées par l'article (voir src/lib/blog-faq.ts). */
  faq: PostFaqEntry[];
  updatedAt: Date;
}

function mapPostListItem(p: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  publishedAt: Date | null;
  author: { name: string | null } | null;
  tags: { tag: { slug: string; label: string } }[];
}): PublishedPostListItem {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverUrl: p.coverUrl,
    coverAlt: p.coverAlt,
    publishedAt: p.publishedAt ?? new Date(0),
    authorName: p.author?.name ?? null,
    tags: p.tags.map((t) => ({ slug: t.tag.slug, label: t.tag.label })),
  };
}

export async function listPublishedPosts({
  page = 1,
  pageSize = BLOG_PAGE_SIZE,
  tag,
}: BlogListOptions = {}): Promise<{ items: PublishedPostListItem[]; total: number }> {
  const where = {
    status: "PUBLISHED" as const,
    publishedAt: { lte: new Date() },
    ...(tag
      ? {
          tags: { some: { tag: { slug: tag } } },
        }
      : {}),
  };

  const [total, raw] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
      },
    }),
  ]);

  return { items: raw.map(mapPostListItem), total };
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublishedPostDetail | null> {
  const p = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: { select: { slug: true, label: true } } } },
    },
  });
  if (!p) return null;
  return {
    ...mapPostListItem(p),
    bodyHtml: p.bodyHtml,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    ogImage: p.ogImage,
    faq: parsePostFaq(p.faq),
    updatedAt: p.updatedAt,
  };
}

/** Articles publiés demandés par slug, dans l'ordre des slugs ; les slugs inconnus sont ignorés. */
export async function listPublishedPostsBySlugs(
  slugs: string[],
): Promise<PublishedPostListItem[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.blogPost.findMany({
    where: {
      slug: { in: slugs },
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: { select: { slug: true, label: true } } } },
    },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.flatMap((slug) => {
    const row = bySlug.get(slug);
    return row ? [mapPostListItem(row)] : [];
  });
}

export async function listAllPublishedTags(): Promise<{ slug: string; label: string; count: number }[]> {
  const rows = await prisma.blogTag.findMany({
    select: {
      slug: true,
      label: true,
      _count: {
        select: {
          posts: {
            where: {
              post: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
            },
          },
        },
      },
    },
    orderBy: { label: "asc" },
  });
  return rows
    .filter((r) => r._count.posts > 0)
    .map((r) => ({ slug: r.slug, label: r.label, count: r._count.posts }));
}

/** Tags « familles d'offre » : trop larges pour dire que deux articles se ressemblent. */
const BROAD_TAG_SLUGS = new Set(["solutions", "services", "formations"]);
const BROAD_TAG_WEIGHT = 0.25;

export interface RelatedCandidate {
  id: string;
  publishedAt: Date | null;
  tagSlugs: string[];
}

/**
 * Classe les articles les plus proches d'un article par thématique.
 *
 * La « catégorie » d'un article, ce sont ses tags. Un tag partagé par peu
 * d'articles (« ged », « sante »…) dit beaucoup plus qu'un tag fourre-tout :
 * chaque tag partagé pèse donc 1 / (nombre d'articles publiés portant ce
 * tag), et les trois tags « familles d'offre » (BROAD_TAG_SLUGS) ne comptent
 * que pour un quart. À score égal, le plus récent passe devant. Si moins de `limit` articles partagent un tag, on complète avec les
 * articles les plus récents (repli).
 *
 * `population` = tous les articles publiés, article courant compris.
 */
export function rankRelatedPostIds(
  currentId: string,
  currentTagSlugs: string[],
  population: RelatedCandidate[],
  limit = 3,
): string[] {
  const tagCount = new Map<string, number>();
  for (const p of population) {
    for (const t of new Set(p.tagSlugs)) {
      tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    }
  }
  const mine = new Set(currentTagSlugs);
  const time = (d: Date | null) => (d ? d.getTime() : 0);

  const scored = population
    .filter((p) => p.id !== currentId)
    .map((p) => {
      let score = 0;
      for (const t of new Set(p.tagSlugs)) {
        if (mine.has(t)) {
          score += (BROAD_TAG_SLUGS.has(t) ? BROAD_TAG_WEIGHT : 1) / (tagCount.get(t) ?? 1);
        }
      }
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || time(b.p.publishedAt) - time(a.p.publishedAt));

  const related = scored.filter((x) => x.score > 0).slice(0, limit);
  const picked = new Set(related.map((x) => x.p.id));
  const fallback = scored
    .filter((x) => x.score === 0 && !picked.has(x.p.id))
    .sort((a, b) => time(b.p.publishedAt) - time(a.p.publishedAt))
    .slice(0, Math.max(0, limit - related.length));

  return [...related, ...fallback].map((x) => x.p.id);
}

export async function listRelatedPosts(
  postId: string,
  tagSlugs: string[],
  limit = 3,
): Promise<PublishedPostListItem[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: {
      id: true,
      publishedAt: true,
      tags: { select: { tag: { select: { slug: true } } } },
    },
  });
  const ids = rankRelatedPostIds(
    postId,
    tagSlugs,
    rows.map((r) => ({
      id: r.id,
      publishedAt: r.publishedAt,
      tagSlugs: r.tags.map((t) => t.tag.slug),
    })),
    limit,
  );
  if (ids.length === 0) return [];

  const posts = await prisma.blogPost.findMany({
    where: { id: { in: ids } },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: { select: { slug: true, label: true } } } },
    },
  });
  const byId = new Map(posts.map((p) => [p.id, p]));
  return ids.flatMap((id) => {
    const p = byId.get(id);
    return p ? [mapPostListItem(p)] : [];
  });
}

export async function listPublishedPostsForSitemap(): Promise<
  { slug: string; updatedAt: Date; publishedAt: Date | null }[]
> {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function listLatestPublishedForFeed(limit = 20): Promise<
  PublishedPostDetail[]
> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: { select: { slug: true, label: true } } } },
    },
  });
  return rows.map((p) => ({
    ...mapPostListItem(p),
    bodyHtml: p.bodyHtml,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    ogImage: p.ogImage,
    faq: parsePostFaq(p.faq),
    updatedAt: p.updatedAt,
  }));
}
