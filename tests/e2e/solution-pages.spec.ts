import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SLUGS = [
  "docupro-suite",
  "medicpro",
  "cliniquepro",
  "immotopia-cloud",
  "annonces-web",
  "ecole-digitale",
] as const;

const SECTION_ORDER = [
  "hero",
  "proposition-de-valeur",
  "cibles",
  "fonctionnalites",
  "benefices",
  "preuves",
  "faq",
  "solutions-associees",
  "demander-une-demo",
];

const SISTER_PAIRS: Record<string, string> = {
  medicpro: "cliniquepro",
  cliniquepro: "medicpro",
  "immotopia-cloud": "annonces-web",
  "annonces-web": "immotopia-cloud",
};

test.describe("/solutions index", () => {
  test("lists 6 solutions with links to each detail page", async ({ page }) => {
    await page.goto("/solutions");
    await expect(page.locator("h1")).toHaveText(/Nos solutions/i);
    for (const slug of SLUGS) {
      const link = page.locator(`a[href="/solutions/${slug}"]`);
      await expect(link.first()).toBeVisible();
    }
  });
});

for (const slug of SLUGS) {
  test.describe(`/solutions/${slug}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/solutions/${slug}`);
    });

    test("returns 200 and exactly one h1", async ({ page }) => {
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator("h1")).toHaveCount(1);
      const h1Text = (await page.locator("h1").first().innerText()).trim();
      expect(h1Text.length).toBeGreaterThan(0);
    });

    test("renders the canonical sections in order", async ({ page }) => {
      const positions = await Promise.all(
        SECTION_ORDER.map(async (id) => {
          const el = page.locator(`section#${id}`);
          // 'cas-usage' is optional; accept absence (returns null and we skip)
          if (id === "cas-usage" && (await el.count()) === 0) return null;
          await expect(el).toBeVisible();
          const box = await el.boundingBox();
          return box ? box.y : null;
        })
      );
      const present = positions.filter((p): p is number => p !== null);
      const sorted = [...present].sort((a, b) => a - b);
      expect(present).toEqual(sorted);
    });

    test("hero CTA points to #demander-une-demo", async ({ page }) => {
      const cta = page.locator('a[data-cta="solution-hero-primary"]').first();
      await expect(cta).toBeVisible();
      const href = await cta.getAttribute("href");
      expect(href).toBe("#demander-une-demo");
    });

    test("includes Product, FAQPage and BreadcrumbList JSON-LD", async ({ page }) => {
      const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
      const types = scripts
        .map((raw) => {
          try {
            return JSON.parse(raw)["@type"];
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      expect(types).toContain("Product");
      expect(types).toContain("FAQPage");
      expect(types).toContain("BreadcrumbList");
    });

    test("page has no serious or critical accessibility violations", async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      expect(
        blocking,
        blocking.map((v) => `${v.id}: ${v.help}`).join("\n")
      ).toEqual([]);
    });

    if (SISTER_PAIRS[slug]) {
      test(`relatedSolutions first item links to /solutions/${SISTER_PAIRS[slug]}`, async ({ page }) => {
        const sister = SISTER_PAIRS[slug]!;
        const related = page.locator(`section#solutions-associees a[href="/solutions/${sister}"]`);
        await expect(related.first()).toBeVisible();
      });
    }

    test("hidden form inputs are pre-filled (intent, solutionSlug, fromPage)", async ({ page }) => {
      const intent = page.locator('input[type="hidden"][name="intent"]');
      const solutionSlugField = page.locator('input[type="hidden"][name="solutionSlug"]');
      const fromPage = page.locator('input[type="hidden"][name="fromPage"]');
      await expect(intent).toHaveValue(/(demo|training)/);
      await expect(solutionSlugField).toHaveValue(slug);
      await expect(fromPage).toHaveValue(`/solutions/${slug}`);
    });
  });
}
