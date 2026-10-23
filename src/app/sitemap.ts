import type { MetadataRoute } from "next";
import { listAllPublishedTags, listPublishedPostsForSitemap } from "@/lib/blog";
import { listPublishedProjectReferencesForSitemap } from "@/lib/projectReferences";
import {
  getAllServiceSlugs,
  getAllSolutionDetailSlugs,
  getAllTrainingSlugs,
} from "@/lib/content";

const BASE_URL = "https://allianceconsultants.net";

/**
 * Le sitemap est généré À LA REQUÊTE et non au build : l'image Docker est
 * construite sans base de données, et une génération statique figeait donc
 * un sitemap sans aucun article du blog (ni référence, ni tag). Ainsi, tout
 * article publié depuis le backoffice apparaît immédiatement, sans redéploiement.
 */
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

// Pages indexables uniquement (cohérent avec robots.ts : pas d'/admin/ ni d'/api/,
// ni de pages en noindex comme /contact-recu ou /contact-erreur).
const staticRoutes = [
  { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { url: "/solutions", priority: 0.9, changeFrequency: "weekly" as const },
  { url: "/services", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/formations", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/references", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/a-propos", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/contact-demo", priority: 0.9, changeFrequency: "monthly" as const },
  { url: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { url: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" as const },
];

/** Lit une source de données ; en cas d'échec, journalise (jamais en silence) et renvoie un repli. */
async function safely<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`[sitemap] ${label} indisponible, section omise :`, error);
    return fallback;
  }
}

function latest(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Les pages issues de fichiers MDX n'ont pas de date de modification fiable
 * (le contenu est copié dans l'image Docker) : on n'indique donc pas de
 * `lastModified` plutôt que d'en inventer une.
 */
function mdxEntries(prefix: string, slugs: string[], priority: number): Entry[] {
  return slugs.map((slug) => ({
    url: `${BASE_URL}${prefix}/${slug}`,
    changeFrequency: "monthly" as const,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [solutionSlugs, serviceSlugs, trainingSlugs, posts, refs, tags] = await Promise.all([
    safely("solutions", getAllSolutionDetailSlugs, [] as string[]),
    safely("services", getAllServiceSlugs, [] as string[]),
    safely("formations", getAllTrainingSlugs, [] as string[]),
    safely("articles du blog", listPublishedPostsForSitemap, []),
    safely("références", listPublishedProjectReferencesForSitemap, []),
    safely("tags du blog", listAllPublishedTags, []),
  ]);

  // Date réelle de dernière modification d'un article : sa mise à jour, ou sa
  // publication si elle est postérieure (article programmé puis mis en ligne).
  const postEntries: Entry[] = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: latest([p.updatedAt, ...(p.publishedAt ? [p.publishedAt] : [])]),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // L'index du blog change dès qu'un article est publié ou modifié.
  const blogLastModified = latest(
    postEntries.flatMap((e) => (e.lastModified ? [new Date(e.lastModified)] : [])),
  );

  const staticEntries: Entry[] = staticRoutes.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    ...(url === "/blog" && blogLastModified ? { lastModified: blogLastModified } : {}),
    changeFrequency,
    priority,
  }));

  const tagEntries: Entry[] = tags.map((t) => ({
    url: `${BASE_URL}/blog/tags/${t.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  const referenceEntries: Entry[] = refs.map((r) => ({
    url: `${BASE_URL}/references/${r.id}`,
    lastModified: r.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...mdxEntries("/solutions", solutionSlugs, 0.8),
    ...mdxEntries("/services", serviceSlugs, 0.8),
    ...mdxEntries("/formations", trainingSlugs, 0.7),
    ...postEntries,
    ...tagEntries,
    ...referenceEntries,
  ];
}
