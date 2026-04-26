import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { SolutionDetailSchema } from "@/lib/validators/content";

const ROOT = path.join(process.cwd(), "content", "solutions");
const EXPECTED_SLUGS = [
  "docupro-suite",
  "medicpro",
  "cliniquepro",
  "immotopia-cloud",
  "annonces-web",
  "ecole-digitale",
];
const SISTER_PAIRS: Record<string, string> = {
  medicpro: "cliniquepro",
  cliniquepro: "medicpro",
  "immotopia-cloud": "annonces-web",
  "annonces-web": "immotopia-cloud",
};
const FORBIDDEN_STRINGS = [
  "Edit Template",
  "Get Consultation Now",
  "Lorem ipsum",
  "Institut Froebel",
  "Submit Form",
  "Your Name Here",
  "TODO:",
  "FIXME:",
  "certifié médical",
  "agréé MDR",
  "conforme CE",
  "licence d'agence immobilière",
  "agréé OHADA",
];

async function loadDetail(slug: string) {
  const filePath = path.join(ROOT, `${slug}.mdx`);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data } = matter(raw);
  return { raw, data };
}

describe("Solutions detail content (feature 001-pages-corporate-solutions)", () => {
  for (const slug of EXPECTED_SLUGS) {
    describe(slug, () => {
      it(`exists at content/solutions/${slug}.mdx and conforms to SolutionDetailSchema`, async () => {
        const { raw, data } = await loadDetail(slug);
        const result = SolutionDetailSchema.safeParse(data);
        expect(
          result.success,
          `${slug} schema errors: ${JSON.stringify(result.error?.issues)}`
        ).toBe(true);

        // Forbidden strings check (case-insensitive)
        const lower = raw.toLowerCase();
        for (const forbidden of FORBIDDEN_STRINGS) {
          expect(
            lower.includes(forbidden.toLowerCase()),
            `${slug} contains forbidden string "${forbidden}"`
          ).toBe(false);
        }
      });

      it("seoTitle contains the solution name", async () => {
        const { data } = await loadDetail(slug);
        const detail = SolutionDetailSchema.parse(data);
        expect(detail.seoTitle.toLowerCase()).toContain(detail.name.toLowerCase());
      });

      it("total features across featureGroups is at least 6", async () => {
        const { data } = await loadDetail(slug);
        const detail = SolutionDetailSchema.parse(data);
        const total = detail.featureGroups.reduce(
          (acc, g) => acc + g.features.length,
          0
        );
        expect(total).toBeGreaterThanOrEqual(6);
      });

      it("relatedSolutions slugs reference known solutions and exclude self", async () => {
        const { data } = await loadDetail(slug);
        const detail = SolutionDetailSchema.parse(data);
        for (const r of detail.relatedSolutions) {
          expect(EXPECTED_SLUGS).toContain(r.slug);
          expect(r.slug).not.toBe(slug);
        }
      });
    });
  }

  it("respects sister pairs (medicpro↔cliniquepro, immotopia-cloud↔annonces-web)", async () => {
    for (const [slug, expectedSister] of Object.entries(SISTER_PAIRS)) {
      const { data } = await loadDetail(slug);
      const detail = SolutionDetailSchema.parse(data);
      expect(
        detail.relatedSolutions[0]?.slug,
        `${slug}: relatedSolutions[0] should be "${expectedSister}"`
      ).toBe(expectedSister);
    }
  });

  it("hero.primaryCta.intent is 'demo' for all solutions except ecole-digitale (which can use 'training')", async () => {
    for (const slug of EXPECTED_SLUGS) {
      const { data } = await loadDetail(slug);
      const detail = SolutionDetailSchema.parse(data);
      const allowed = slug === "ecole-digitale" ? ["demo", "training"] : ["demo"];
      expect(allowed).toContain(detail.hero.primaryCta.intent);
    }
  });
});
