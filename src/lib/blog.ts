import { prisma } from "@/lib/prisma";

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
    updatedAt: p.updatedAt,
  };
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

export async function listRelatedPosts(
  postId: string,
  tagSlugs: string[],
  limit = 3,
): Promise<PublishedPostListItem[]> {
  if (tagSlugs.length === 0) {
    const fallback = await prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
      },
    });
    return fallback.map(mapPostListItem);
  }

  const related = await prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      tags: { some: { tag: { slug: { in: tagSlugs } } } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: { select: { slug: true, label: true } } } },
    },
  });
  return related.map(mapPostListItem);
}

export async function listPublishedPostsForSitemap(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { slug: true, updatedAt: true },
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
    updatedAt: p.updatedAt,
  }));
}
