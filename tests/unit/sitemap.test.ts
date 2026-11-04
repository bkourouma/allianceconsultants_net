import { beforeEach, describe, expect, it, vi } from "vitest";

const blog = vi.hoisted(() => ({
  listPublishedPostsForSitemap: vi.fn(),
  listAllPublishedTags: vi.fn(),
}));
const refs = vi.hoisted(() => ({
  listPublishedProjectReferencesForSitemap: vi.fn(),
}));
const content = vi.hoisted(() => ({
  getAllSolutionDetailSlugs: vi.fn(),
  getAllServiceSlugs: vi.fn(),
  getAllTrainingSlugs: vi.fn(),
}));

vi.mock("@/lib/blog", () => blog);
vi.mock("@/lib/projectReferences", () => refs);
vi.mock("@/lib/content", () => content);

import sitemap, { dynamic } from "@/app/sitemap";

const BASE = "https://allianceconsultants.net";

beforeEach(() => {
  vi.restoreAllMocks();
  blog.listPublishedPostsForSitemap.mockResolvedValue([
    {
      slug: "article-modifie",
      updatedAt: new Date("2026-03-10T08:00:00Z"),
      publishedAt: new Date("2026-01-05T08:00:00Z"),
    },
    {
      // Article programmé puis publié après sa dernière modification.
      slug: "article-programme",
      updatedAt: new Date("2026-02-01T08:00:00Z"),
      publishedAt: new Date("2026-04-01T08:00:00Z"),
    },
  ]);
  blog.listAllPublishedTags.mockResolvedValue([{ slug: "ia", label: "IA", count: 2 }]);
  refs.listPublishedProjectReferencesForSitemap.mockResolvedValue([
    { id: "ref1", updatedAt: new Date("2026-02-02T00:00:00Z") },
  ]);
  content.getAllSolutionDetailSlugs.mockResolvedValue(["medicpro"]);
  content.getAllServiceSlugs.mockResolvedValue(["scanners-professionnels"]);
  content.getAllTrainingSlugs.mockResolvedValue(["ged-archivage"]);
});

describe("sitemap", () => {
  it("est généré à la requête (pas figé au build, où la base est absente)", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("liste tous les articles publiés avec leur vraie date de modification", async () => {
    const entries = await sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    expect(byUrl.get(`${BASE}/blog/article-modifie`)?.lastModified).toEqual(
      new Date("2026-03-10T08:00:00Z"),
    );
    expect(byUrl.get(`${BASE}/blog/article-programme`)?.lastModified).toEqual(
      new Date("2026-04-01T08:00:00Z"),
    );
  });

  it("inclut les pages statiques, services, formations, solutions et références", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const path of [
      "/",
      "/blog",
      "/privacy",
      "/solutions/medicpro",
      "/services/scanners-professionnels",
      "/formations/ged-archivage",
      "/references/ref1",
    ]) {
      expect(urls).toContain(`${BASE}${path}`);
    }
  });

  it("n'expose pas les pages de tag (noindex)", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.includes("/blog/tags/"))).toBe(false);
  });

  it("date /blog par le dernier article, et n'invente pas de date pour les pages MDX", async () => {
    const byUrl = new Map((await sitemap()).map((e) => [e.url, e]));
    expect(byUrl.get(`${BASE}/blog`)?.lastModified).toEqual(new Date("2026-04-01T08:00:00Z"));
    expect(byUrl.get(`${BASE}/solutions/medicpro`)?.lastModified).toBeUndefined();
    expect(byUrl.get(`${BASE}/`)?.lastModified).toBeUndefined();
  });

  it("n'expose aucune page non indexable ni doublon", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url).not.toMatch(/\/(admin|api)(\/|$)/);
      expect(url).not.toMatch(/contact-recu|contact-erreur/);
    }
  });

  it("reste utilisable (et journalise) si la base est indisponible", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    blog.listPublishedPostsForSitemap.mockRejectedValue(new Error("db down"));
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain(`${BASE}/`);
    expect(urls.some((u) => u.includes("/blog/article-"))).toBe(false);
    expect(spy).toHaveBeenCalled();
  });
});
