import { test, expect } from "@playwright/test";

test.describe("Lead form on /solutions/medicpro", () => {
  test("form is rendered with required fields and a hidden honeypot", async ({ page }) => {
    await page.goto("/solutions/medicpro");
    await expect(page.locator("form")).toBeVisible();

    const requiredFields = ["name", "email", "phone", "organization", "message"];
    for (const name of requiredFields) {
      await expect(
        page.locator(`form [name="${name}"]`)
      ).toBeVisible();
    }

    // Honeypot must exist but be visually/clavier hidden
    const honeypot = page.locator('input[name="honeypot"]');
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");
  });

  test("/api/lead rejects payload missing consent with HTTP 400", async ({ request }) => {
    const res = await request.post("/api/lead", {
      data: {
        intent: "demo",
        solutionSlug: "medicpro",
        fromPage: "/solutions/medicpro",
        fromBlock: "section-demo",
        name: "Jean Dupont",
        email: "jean@example.com",
        phone: "+225010203",
        organization: "Test SARL",
        message: "Bonjour, demande de démo MedicPro pour évaluation interne.",
        // consent missing on purpose
        honeypot: "",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { ok: boolean; errors?: Record<string, string> };
    expect(json.ok).toBe(false);
    expect(json.errors).toBeTruthy();
  });

  test("/api/lead silently accepts honeypot-filled payload with HTTP 204", async ({ request }) => {
    const res = await request.post("/api/lead", {
      data: {
        intent: "demo",
        solutionSlug: "medicpro",
        fromPage: "/solutions/medicpro",
        fromBlock: "section-demo",
        name: "Bot Bot",
        email: "bot@example.com",
        phone: "+225000000",
        organization: "Bot Org",
        message: "Spam content from bot.",
        consent: true,
        honeypot: "I am a bot",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(204);
  });
});
