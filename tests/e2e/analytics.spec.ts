import { test, expect } from "@playwright/test";

// Garde-fou : le suivi d'audience (Umami, chargé seulement en production) ne doit jamais provoquer d'erreur JavaScript
// ni gêner un clic sur la page d'accueil.

test.describe("Homepage — erreurs JavaScript côté navigateur", () => {
  test("la page d'accueil se charge sans erreur JavaScript", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForTimeout(300);

    expect(errors).toHaveLength(0);
  });

  test("solution card click does not cause JS error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");

    // Click first solution CTA
    const firstSolutionCta = page.locator('article a[href*="intent=demo"]').first();
    await firstSolutionCta.scrollIntoViewIfNeeded();

    // Use a promise race to handle navigation
    await Promise.race([
      firstSolutionCta.click(),
      page.waitForTimeout(500),
    ]).catch(() => {});

    expect(errors).toHaveLength(0);
  });
});
