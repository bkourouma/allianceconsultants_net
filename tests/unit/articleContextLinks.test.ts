import { describe, it, expect } from "vitest";
import { contextLinksForTags } from "@/components/blog/ArticleContextLinks";
import fs from "node:fs/promises";
import path from "node:path";

describe("ArticleContextLinks & Footer menu (PR #133)", () => {
  it("contextLinksForTags retourne les liens pertinents pour chaque tag sans doublon", () => {
    const linksGed = contextLinksForTags(["ged"]);
    expect(linksGed).toHaveLength(2);
    expect(linksGed.map((l) => l.href)).toEqual([
      "/services/dematerialisation-archives",
      "/solutions/docupro-suite",
    ]);

    const linksSante = contextLinksForTags(["sante"]);
    expect(linksSante.map((l) => l.href)).toContain("/solutions/cliniquepro");

    const linksImmo = contextLinksForTags(["immobilier"]);
    expect(linksImmo.map((l) => l.href)).toContain("/solutions/immotopia-cloud");

    const deduplicated = contextLinksForTags(["ia", "automatisation"]);
    const hrefs = deduplicated.map((l) => l.href);
    const uniqueHrefs = Array.from(new Set(hrefs));
    expect(hrefs.length).toBe(uniqueHrefs.length);
  });

  it("site-settings.json: le footer propose un accès complet aux solutions et pas seulement MedicPro", async () => {
    const raw = await fs.readFile(path.join(process.cwd(), "content", "site-settings.json"), "utf-8");
    const settings = JSON.parse(raw);
    const solutions = settings.footerMenu.solutions as Array<{ label: string; href: string }>;

    expect(solutions.length).toBeGreaterThan(1);
    const hrefs = solutions.map((s) => s.href);
    expect(hrefs).toContain("/solutions/docupro-suite");
    expect(hrefs).toContain("/solutions/cliniquepro");
    expect(hrefs).toContain("/solutions/immotopia-cloud");
    expect(hrefs).toContain("/solutions/ecole-digitale");
    expect(hrefs).toContain("/solutions/medicpro");
    expect(hrefs).toContain("/solutions");
  });
});
