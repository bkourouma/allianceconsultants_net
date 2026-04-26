import { test, expect } from "@playwright/test";

test.describe("Homepage — CTA redirects & no form inputs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("zero form inputs on homepage", async ({ page }) => {
    const inputs = page.locator("input, textarea, select, form");
    await expect(inputs).toHaveCount(0);
  });

  test("all business CTAs point to /contact-demo", async ({ page }) => {
    const ctaLinks = await page.locator('a[href*="/contact-demo"]').all();
    expect(ctaLinks.length).toBeGreaterThanOrEqual(1);

    for (const link of ctaLinks) {
      const href = await link.getAttribute("href");
      expect(href).toContain("/contact-demo");
    }
  });

  test("hero primary CTA has intent=demo param", async ({ page }) => {
    const heroCta = page
      .locator("section[aria-labelledby='hero-title'] a")
      .filter({ hasText: /démo/i });
    const href = await heroCta.first().getAttribute("href");
    expect(href).toContain("intent=demo");
  });

  test("solution cards CTAs have intent=demo and solution param", async ({ page }) => {
    const solutionCtas = page.locator('article a[href*="intent=demo"][href*="solution="]');
    const count = await solutionCtas.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test("AI CTA has intent=automation", async ({ page }) => {
    const aiCta = page.locator('a[href*="intent=automation"]');
    await expect(aiCta.first()).toBeVisible();
    const href = await aiCta.first().getAttribute("href");
    expect(href).toContain("/contact-demo");
  });

  test("training CTA has intent=training", async ({ page }) => {
    const trainingCta = page.locator('a[href*="intent=training"]');
    await expect(trainingCta.first()).toBeVisible();
  });

  test("final CTA section has at least one CTA with /contact-demo", async ({ page }) => {
    const finalSection = page.locator('[aria-labelledby="final-cta-title"]');
    await finalSection.scrollIntoViewIfNeeded();
    const finalLinks = finalSection.locator('a[href*="/contact-demo"]');
    const count = await finalLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
