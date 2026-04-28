import type { MetadataRoute } from "next";
import { listAllPublishedTags, listPublishedPostsForSitemap } from "@/lib/blog";
import { listPublishedProjectReferencesForSitemap } from "@/lib/projectReferences";
import { getAllSolutionDetailSlugs } from "@/lib/content";

const BASE_URL = "https://allianceconsultants.net";

const staticRoutes = [
  { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { url: "/solutions", priority: 0.9, changeFrequency: "weekly" as const },
  { url: "/services", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/formations", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/references", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/a-propos", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/contact-demo", priority: 0.9, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = staticRoutes.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const solutionSlugs = await getAllSolutionDetailSlugs().catch(() => [] as string[]);
  const solutionEntries = solutionSlugs.map((slug) => ({
    url: `${BASE_URL}/solutions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPostsForSitemap();
    blogEntries = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // En cas de DB indisponible (preview, build sans Postgres), on
    // dégrade gracieusement et on n'ajoute que les pages statiques.
    blogEntries = [];
  }

  let referenceEntries: MetadataRoute.Sitemap = [];
  try {
    const refs = await listPublishedProjectReferencesForSitemap();
    referenceEntries = refs.map((r) => ({
      url: `${BASE_URL}/references/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    referenceEntries = [];
  }

  let tagEntries: MetadataRoute.Sitemap = [];
  try {
    const tags = await listAllPublishedTags();
    tagEntries = tags.map((t) => ({
      url: `${BASE_URL}/blog/tags/${t.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch {
    tagEntries = [];
  }

  return [
    ...staticEntries,
    ...solutionEntries,
    ...blogEntries,
    ...tagEntries,
    ...referenceEntries,
  ];
}
