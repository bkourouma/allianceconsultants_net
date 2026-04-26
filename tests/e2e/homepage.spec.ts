import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage — US acceptance scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // US1 — Hero above-the-fold
  test("US1: hero visible above fold on desktop with H1, CTA and badges", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("solutions");

    // Unique H1
    await expect(page.locator("h1")).toHaveCount(1);

    // Primary CTA visible
    const demoCta = page.getByRole("link", { name: /démo/i });
    await expect(demoCta.first()).toBeVisible();

    // Reassurance badges
    const badges = page.locator('[aria-label*="Points forts"] span');
    await expect(badges).toHaveCount(8);
  });

  test("US1: hero visible above fold on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });

  // US2 — 6 solution cards equitable
  test("US2: 6 solution cards rendered with equitable sizing", async ({ page }) => {
    const cards = page.locator("article").filter({ hasText: "Demander une démo" });
    await expect(cards).toHaveCount(6);

    // Each card has name, description, benefit
    for (const card of await cards.all()) {
      await expect(card.locator("h3")).toBeVisible();
      await expect(card.locator("p").first()).toBeVisible();
    }
  });

  test("US2: each solution card links to its solution page", async ({ page }) => {
    const cardLinks = page.locator('article a[href^="/solutions/"]');
    await expect(cardLinks).toHaveCount(6);
  });

  // US3 — AI section reachable by scroll
  test("US3: AI section reachable by scrolling with ≥5 capability bullets", async ({ page }) => {
    const aiSection = page.locator('[aria-labelledby="ai-section-title"]');
    await aiSection.scrollIntoViewIfNeeded();
    await expect(aiSection).toBeVisible();

    const bullets = aiSection.locator("li");
    const count = await bullets.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("US3: AI CTA links to /contact-demo?intent=automation", async ({ page }) => {
    const aiCta = page.locator('[aria-labelledby="ai-section-title"] a[href*="intent=automation"]');
    await aiCta.scrollIntoViewIfNeeded();
    await expect(aiCta).toBeVisible();
    const href = await aiCta.getAttribute("href");
    expect(href).toContain("/contact-demo");
    expect(href).toContain("intent=automation");
  });

  // US4 — Formations
  test("US4: 2 trainings CTAs visible and routing correctly", async ({ page }) => {
    const trainingsSection = page.locator('[aria-labelledby="trainings-title"]');
    await trainingsSection.scrollIntoViewIfNeeded();

    const catalogueLink = page.getByRole("link", { name: /Voir le catalogue/i });
    await expect(catalogueLink).toBeVisible();
    await expect(catalogueLink).toHaveAttribute("href", "/formations");

    const trainingCta = page.getByRole("link", { name: /formation entreprise/i });
    await expect(trainingCta).toBeVisible();
    const href = await trainingCta.getAttribute("href");
    expect(href).toContain("intent=training");
  });

  // US5 — 5 services cards
  test("US5: 5 service cards with title, description and link", async ({ page }) => {
    const servicesSection = page.locator('[aria-labelledby="services-title"]');
    await servicesSection.scrollIntoViewIfNeeded();

    const serviceLinks = page.locator('article a[href^="/services/"]');
    await expect(serviceLinks).toHaveCount(5);
  });

  // US6 — No placeholder content
  test("US6: no placeholder logos or unvalidated metrics shown", async ({ page }) => {
    const content = await page.content();
    expect(content).not.toContain("placeholder");
    expect(content).not.toContain("Lorem ipsum");
    expect(content).not.toContain("TODO");
  });

  test("US6: history milestones visible", async ({ page }) => {
    const timeline = page.locator("ol[aria-label*='Histoire']");
    await timeline.scrollIntoViewIfNeeded();
    await expect(timeline).toBeVisible();

    const milestones = timeline.locator("li");
    await expect(milestones).toHaveCount(4);
  });

  // US7 — Final CTA at bottom
  test("US7: final CTA section at page bottom routes to /contact-demo", async ({ page }) => {
    const finalCta = page.locator('[aria-labelledby="final-cta-title"]');
    await finalCta.scrollIntoViewIfNeeded();
    await expect(finalCta).toBeVisible();

    const ctaLinks = finalCta.locator('a[href*="/contact-demo"]');
    await expect(ctaLinks.first()).toBeVisible();
  });

  // Accessibility
  test("a11y: no critical accessibility violations on homepage", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });
});
