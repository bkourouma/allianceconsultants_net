import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/blog", () => ({
  listPublishedPostsForSitemap: async () => [
    { slug: "article-un", updatedAt: new Date("2026-05-01T00:00:00Z") },
  ],
  listAllPublishedTags: async () => [{ slug: "ia", label: "IA", count: 1 }],
  listLatestPublishedForFeed: async () => [
    {
      slug: "article-un",
      title: "Article un",
      excerpt: "Résumé de l'article.",
      seoDescription: null,
    },
  ],
}));
vi.mock("@/lib/projectReferences", () => ({
  listPublishedProjectReferencesForSitemap: async () => [
    { id: "ref1", updatedAt: new Date("2026-04-01T00:00:00Z") },
  ],
  listLatestPublishedProjectReferences: async () => [
    {
      id: "ref1",
      companyName: "Client SA",
      projectTitle: "Archivage",
      problem: "Papier partout.",
      impact: "Recherche en secondes.",
    },
  ],
}));

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as getLlms } from "@/app/llms.txt/route";

describe("sitemap", () => {
  it("lists services, trainings, solutions and the legal pages", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://allianceconsultants.net/services/dematerialisation-archives");
    expect(urls).toContain("https://allianceconsultants.net/formations/sql-server");
    expect(urls).toContain("https://allianceconsultants.net/solutions/medicpro");
    expect(urls).toContain("https://allianceconsultants.net/privacy");
    expect(urls).toContain("https://allianceconsultants.net/mentions-legales");
    expect(urls).toContain("https://allianceconsultants.net/blog/article-un");
    expect(urls).toContain("https://allianceconsultants.net/references/ref1");
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("only carries real dates and no ignored priority/changeFrequency", async () => {
    const entries = await sitemap();
    const post = entries.find((e) => e.url.endsWith("/blog/article-un"))!;
    expect(post.lastModified).toEqual(new Date("2026-05-01T00:00:00Z"));
    const service = entries.find((e) => e.url.endsWith("/services/scanners-professionnels"))!;
    expect(service.lastModified).toBeUndefined();
    for (const e of entries) {
      expect(e.priority).toBeUndefined();
      expect(e.changeFrequency).toBeUndefined();
    }
  });
});

describe("robots", () => {
  const { rules, sitemap: sitemapUrl } = robots();
  const groups = Array.isArray(rules) ? rules : [rules];

  it("points to the sitemap", () => {
    expect(sitemapUrl).toBe("https://allianceconsultants.net/sitemap.xml");
  });

  it("names AI crawlers explicitly and repeats the private paths in every group", () => {
    const agents = groups.flatMap((g) =>
      Array.isArray(g.userAgent) ? g.userAgent : [g.userAgent],
    );
    for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      expect(agents).toContain(bot);
    }
    for (const g of groups) {
      expect(g.disallow).toEqual(["/admin/", "/api/"]);
    }
  });
});

describe("llms.txt", () => {
  it("follows the llms.txt layout and links the main pages", async () => {
    const res = await getLlms();
    expect(res.headers.get("content-type")).toContain("text/plain");
    const body = await res.text();
    expect(body.startsWith("# Alliance Consultants\n")).toBe(true);
    expect(body).toMatch(/\n> .+/);
    expect(body).toContain("## Solutions logicielles (SaaS métiers)");
    expect(body).toContain("(https://allianceconsultants.net/solutions/medicpro)");
    expect(body).toContain("(https://allianceconsultants.net/formations/sql-server)");
    expect(body).toContain("(https://allianceconsultants.net/blog/article-un)");
    expect(body).toContain("Client SA — Archivage");
    expect(body).toContain("(https://allianceconsultants.net/mentions-legales)");
    expect(body).not.toMatch(/\n{3,}/);
  });
});
