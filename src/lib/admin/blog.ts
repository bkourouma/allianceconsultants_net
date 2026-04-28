import { prisma } from "@/lib/prisma";
import type { Prisma, PostStatus } from "@prisma/client";
import { ensureUniqueBlogPostSlug, slugify } from "@/lib/slug";
import { sanitizeBlogHtml } from "@/lib/sanitize";
import {
  BlogPostInputSchema,
  BlogPostPatchSchema,
  type BlogPostInput,
  type BlogPostPatch,
} from "@/lib/validators/blog";

export const ADMIN_POSTS_PAGE_SIZE = 20;

export async function listAdminPosts({
  page = 1,
  pageSize = ADMIN_POSTS_PAGE_SIZE,
  status,
  search,
}: {
  page?: number;
  pageSize?: number;
  status?: PostStatus;
  search?: string;
} = {}) {
  const where: Prisma.BlogPostWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? { title: { contains: search, mode: "insensitive" } }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { name: true, email: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
      },
    }),
  ]);

  return { items, total };
}

export async function getAdminPostById(id: string) {
  return prisma.blogPost.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: { select: { id: true, slug: true, label: true } } } },
    },
  });
}

async function resolveTagIds(labels: string[]): Promise<string[]> {
  if (labels.length === 0) return [];
  const unique = Array.from(
    new Map(labels.map((l) => [slugify(l), l.trim()] as const)).entries(),
  );

  const ids: string[] = [];
  for (const [slug, label] of unique) {
    if (!slug) continue;
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      create: { slug, label },
      update: { label },
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function createBlogPost(
  rawInput: unknown,
  authorId: string,
) {
  const parsed = BlogPostInputSchema.parse(rawInput);
  return persistNewPost(parsed, authorId);
}

async function persistNewPost(input: BlogPostInput, authorId: string) {
  const desiredSlug = input.slug?.trim() || slugify(input.title);
  const slug = await ensureUniqueBlogPostSlug(desiredSlug);
  const tagIds = await resolveTagIds(input.tags ?? []);
  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  const publishedAt =
    input.status === "PUBLISHED"
      ? input.publishedAt
        ? new Date(input.publishedAt as string)
        : new Date()
      : input.publishedAt
        ? new Date(input.publishedAt as string)
        : null;

  return prisma.blogPost.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      coverUrl: input.coverUrl ?? null,
      coverAlt: input.coverAlt ?? null,
      bodyHtml,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      status: input.status,
      publishedAt,
      authorId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });
}

export async function updateBlogPost(id: string, rawInput: unknown) {
  const patch = BlogPostPatchSchema.parse(rawInput) as BlogPostPatch;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Article introuvable.");
  }

  let nextSlug = existing.slug;
  if (patch.slug && patch.slug !== existing.slug) {
    nextSlug = await ensureUniqueBlogPostSlug(patch.slug, id);
  } else if (patch.title && !patch.slug && existing.title !== patch.title) {
    nextSlug = await ensureUniqueBlogPostSlug(slugify(patch.title), id);
  }

  const data: Prisma.BlogPostUpdateInput = {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(nextSlug !== existing.slug ? { slug: nextSlug } : {}),
    ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
    ...(patch.coverUrl !== undefined ? { coverUrl: patch.coverUrl } : {}),
    ...(patch.coverAlt !== undefined ? { coverAlt: patch.coverAlt } : {}),
    ...(patch.bodyHtml !== undefined
      ? { bodyHtml: sanitizeBlogHtml(patch.bodyHtml) }
      : {}),
    ...(patch.seoTitle !== undefined ? { seoTitle: patch.seoTitle } : {}),
    ...(patch.seoDescription !== undefined
      ? { seoDescription: patch.seoDescription }
      : {}),
    ...(patch.ogImage !== undefined ? { ogImage: patch.ogImage } : {}),
  };

  if (patch.status) {
    data.status = patch.status;
    if (patch.status === "PUBLISHED" && !existing.publishedAt && !patch.publishedAt) {
      data.publishedAt = new Date();
    }
  }
  if (patch.publishedAt !== undefined) {
    data.publishedAt =
      patch.publishedAt === null ? null : new Date(patch.publishedAt as string);
  }

  if (patch.tags) {
    const tagIds = await resolveTagIds(patch.tags);
    await prisma.blogPostTag.deleteMany({ where: { postId: id } });
    data.tags = {
      create: tagIds.map((tagId) => ({ tagId })),
    };
  }

  return prisma.blogPost.update({ where: { id }, data });
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPostTag.deleteMany({ where: { postId: id } });
  await prisma.blogPost.delete({ where: { id } });
}

export async function adminDashboardStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [leadsLast7d, leadsNew, postsPublished, postsDraft] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
  ]);

  return { leadsLast7d, leadsNew, postsPublished, postsDraft };
}
