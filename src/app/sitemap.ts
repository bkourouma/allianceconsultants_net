import type { MetadataRoute } from "next";

const BASE_URL = "https://allianceconsultants.net";

const staticRoutes = [
  { url: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { url: "/solutions", priority: 0.9, changeFrequency: "weekly" as const },
  { url: "/services", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/formations", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/references", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/ressources", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/a-propos", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/contact-demo", priority: 0.9, changeFrequency: "monthly" as const },
];

const solutionSlugs = [
  "docupro-suite",
  "medicpro",
  "cliniquepro",
  "immotopia-cloud",
  "annonces-web",
  "ecole-digitale",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticRoutes.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const solutionEntries = solutionSlugs.map((slug) => ({
    url: `${BASE_URL}/solutions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...solutionEntries];
}
