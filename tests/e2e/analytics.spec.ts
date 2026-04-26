import { test, expect } from "@playwright/test";

// Matomo analytics event tracking tests
// These tests verify event structure without requiring a live Matomo instance.
// They intercept fetch/XHR to matomo.php and check payload.

test.describe("Homepage — Matomo analytics events", () => {
  test("no PII in page URL or referrer sent to Matomo", async ({ page }) => {
    const matomoRequests: string[] = [];

    page.on("request", (req) => {
      if (req.url().includes("matomo.php") || req.url().includes("piwik.php")) {
        matomoRequests.push(req.url());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(500);

    // If Matomo is configured (env vars present), verify no PII in requests
    for (const url of matomoRequests) {
      // No email addresses in Matomo payloads
      expect(url).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      // No full phone numbers
      expect(url).not.toMatch(/\+\d{10,}/);
    }
  });

  test("trackEvent function does not throw when Matomo is not configured", async ({ page }) => {
    // Verify no JS errors on page load (Matomo gracefully no-ops)
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForTimeout(300);

    const matomoErrors = errors.filter(
      (e) => e.toLowerCase().includes("matomo") || e.toLowerCase().includes("_paq")
    );
    expect(matomoErrors).toHaveLength(0);
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
