import { prisma } from "@/lib/prisma";
import { readingMinutesFromHtml } from "@/components/blog/post-utils";

/**
 * Reading time (minutes) per post id, computed from the stored body.
 * The list loader in lib/blog.ts does not return bodies, so listings fetch
 * them here (≤ one page of posts). Failure is non-fatal: no reading time shown.
 */
export async function getReadingMinutes(
  ids: string[],
): Promise<Record<string, number>> {
  if (ids.length === 0) return {};
  try {
    const rows = await prisma.blogPost.findMany({
      where: { id: { in: ids } },
      select: { id: true, bodyHtml: true },
    });
    return Object.fromEntries(
      rows.map((r) => [r.id, readingMinutesFromHtml(r.bodyHtml)]),
    );
  } catch {
    return {};
  }
}
