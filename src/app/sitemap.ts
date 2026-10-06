import type { MetadataRoute } from "next";
import { listAllPublishedTags, listPublishedPostsForSitemap } from "@/lib/blog";
import { listPublishedProjectReferencesForSitemap } from "@/lib/projectReferences";
import {
  getAllServiceSlugs,
  getAllSolutionDetailSlugs,
  getAllTrainingSlugs,
} from "@/lib/content";
import { LEGAL_NOTICE_LAST_UPDATED, PRIVACY_LAST_UPDATED } from "@/lib/legal";
import { SITE_URL } from "@/lib/seo";

// Rendu à chaque requête : en statique, le sitemap serait figé au build (sans
// base de données) et n'afficherait jamais les articles publiés après le déploiement.
export const dynamic = "force-dynamic";

/**
 * Seules les dates réellement connues sont publiées : `lastModified` vient de
 * la base (articles, références) ou des pages légales datées. Les pages
 * issues de fichiers MDX n'en ont pas de fiable (la date des fichiers est celle
 * du déploiement), donc elle est omise plutôt qu'inventée. `priority` et
 * `changeFrequency` sont ignorés par Google et Bing : on ne les émet pas.
 */
type Entry = MetadataRoute.Sitemap[number];

const staticRoutes = [
  "/",
  "/solutions",
  "/services",
  "/formations",
  "/references",
  "/blog",
  "/a-propos",
  "/contact-demo",
];

const legalRoutes: { path: string; lastModified: string }[] = [
  { path: "/privacy", lastModified: PRIVACY_LAST_UPDATED },
  { path: "/mentions-legales", lastModified: LEGAL_NOTICE_LAST_UPDATED },
];

const entry = (path: string, lastModified?: Date | string): Entry => ({
  url: `${SITE_URL}${path}`,
  ...(lastModified ? { lastModified } : {}),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [solutionSlugs, serviceSlugs, trainingSlugs] = await Promise.all([
    getAllSolutionDetailSlugs().catch(() => [] as string[]),
    getAllServiceSlugs().catch(() => [] as string[]),
    getAllTrainingSlugs().catch(() => [] as string[]),
  ]);

  // En cas de DB indisponible (preview, build sans Postgres), on dégrade
  // gracieusement et on n'ajoute que les pages issues des fichiers.
  const posts = await listPublishedPostsForSitemap().catch(() => []);
  const refs = await listPublishedProjectReferencesForSitemap().catch(() => []);
  const tags = await listAllPublishedTags().catch(() => []);

  // Date de l'index du blog : la dernière modification d'un article publié.
  const latestPostUpdate = posts.reduce<Date | undefined>(
    (latest, p) => (!latest || p.updatedAt > latest ? p.updatedAt : latest),
    undefined,
  );

  return [
    ...staticRoutes.map((path) =>
      entry(path, path === "/blog" ? latestPostUpdate : undefined),
    ),
    ...solutionSlugs.map((slug) => entry(`/solutions/${slug}`)),
    ...serviceSlugs.map((slug) => entry(`/services/${slug}`)),
    ...trainingSlugs.map((slug) => entry(`/formations/${slug}`)),
    ...posts.map((p) => entry(`/blog/${p.slug}`, p.updatedAt)),
    ...tags.map((t) => entry(`/blog/tags/${t.slug}`)),
    ...refs.map((r) => entry(`/references/${r.id}`, r.updatedAt)),
    ...legalRoutes.map((r) => entry(r.path, r.lastModified)),
  ];
}
