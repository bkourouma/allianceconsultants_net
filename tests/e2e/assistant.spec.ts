import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Le chat et le dépôt de lead sont simulés : ces tests ne dépendent ni d'une clé API Anthropic ni de la base de données.

const NDJSON = (events: unknown[]) => events.map((e) => JSON.stringify(e)).join("\n") + "\n";

async function openAssistant(page: Page) {
  await page.getByRole("button", { name: /Ouvrir l'assistant Alliance/ }).click();
  const dialog = page.getByRole("dialog", { name: /Assistant Alliance/ });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Fil de conversation seul : la région aria-live masquée (lecteurs d'écran) répète le dernier message. */
function thread(dialog: ReturnType<Page["getByRole"]>) {
  return dialog.getByRole("log", { name: "Conversation" });
}

/** Le suivi de parcours enregistre la page dès son initialisation : on attend ce signal avant de faire passer le temps. */
async function waitForTracker(page: Page, topicId: string) {
  await page.waitForFunction(
    (id) => (window.sessionStorage.getItem("acc-assistant-journey") ?? "").includes(`"id":"${id}"`),
    topicId,
  );
}

/** Lit la page comme un visiteur : défilement jusqu'à 60 %, puis temps qui passe (horloge simulée). */
async function readPage(page: Page, seconds: number) {
  await page.waitForLoadState("load");
  await page.mouse.move(200, 300);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
  await page.clock.runFor(seconds * 1000);
}

test.describe("Assistant IA — widget", () => {
  test("le lanceur est présent, sans champ de saisie tant que l'assistant n'est pas ouvert", async ({ page }) => {
    await page.goto("/");
    const launcher = page.getByRole("button", { name: /Ouvrir l'assistant Alliance/ });
    await expect(launcher).toBeVisible();
    await expect(page.locator("textarea")).toHaveCount(0);

    const dialog = await openAssistant(page);
    await expect(thread(dialog).getByText(/je suis l'assistant IA d'Alliance Consultants/)).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Votre message" })).toBeVisible();

    // Échap referme le panneau et rend le focus au lanceur.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
  });

  test("n'engage pas à l'arrivée, mais après une vraie lecture de la page CliniquePro", async ({ page }) => {
    await page.clock.install();
    await page.goto("/solutions/cliniquepro");
    await waitForTracker(page, "solutions/cliniquepro");
    const nudge = page.getByText("Je vois que vous vous intéressez à CliniquePro. Vous dirigez une clinique ?");

    // Quelques secondes sur la page : rien.
    await page.clock.runFor(5000);
    await expect(nudge).toHaveCount(0);

    // Lecture réelle (défilement + temps) : l'accroche apparaît.
    await readPage(page, 20);
    await expect(nudge).toBeVisible();

    // Un clic l'ouvre sur la question de découverte propre à CliniquePro.
    await page.getByRole("button", { name: /Discuter avec l'assistant/ }).click();
    const dialog = page.getByRole("dialog", { name: /Assistant Alliance/ });
    await expect(thread(dialog).getByText(/vous êtes propriétaire ou responsable d'une clinique/)).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Je dirige une clinique" })).toBeVisible();
  });

  test("ne lance jamais d'accroche sur la page de contact", async ({ page }) => {
    await page.clock.install();
    await page.goto("/contact-demo");
    await waitForTracker(page, "contact-demo");
    await readPage(page, 90);
    await expect(page.getByRole("button", { name: /Discuter avec l'assistant/ })).toHaveCount(0);
  });

  test("une accroche fermée ne revient pas dans la session", async ({ page }) => {
    // Deux chargements de page : en développement, la compilation à la demande peut être lente.
    test.slow();
    await page.clock.install();
    await page.goto("/solutions/medicpro");
    await waitForTracker(page, "solutions/medicpro");
    await readPage(page, 20);
    await expect(page.getByRole("button", { name: /Discuter avec l'assistant/ })).toBeVisible();
    await page.getByRole("button", { name: "Fermer la suggestion" }).click();

    await page.goto("/solutions/cliniquepro");
    await waitForTracker(page, "solutions/cliniquepro");
    await readPage(page, 60);
    await expect(page.getByRole("button", { name: /Discuter avec l'assistant/ })).toHaveCount(0);
  });
});

test.describe("Assistant IA — du premier message à la démo", () => {
  test("conversation, coordonnées avec consentement, puis réservation Calendly", async ({ page }) => {
    const chatBodies: unknown[] = [];
    await page.route("**/api/assistant/chat", async (route) => {
      chatBodies.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: "application/x-ndjson",
        body: NDJSON([
          { t: "text", d: "Merci pour ces précisions. Pour préparer une démonstration adaptée, " },
          { t: "text", d: "je peux transmettre vos coordonnées à un consultant." },
          { t: "actions", actions: [{ type: "contact_form", summary: "Directeur de clinique, 4 médecins, Excel." }] },
          { t: "done" },
        ]),
      });
    });
    // Objet plutôt que variable : renseigné depuis la closure de la route simulée.
    const lead: { payload: Record<string, unknown> | null } = { payload: null };
    await page.route("**/api/lead", async (route) => {
      lead.payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, reference: "ref-test", mailSent: true }),
      });
    });
    await page.route("https://calendly.com/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<html><body>Calendly (simulé)</body></html>" }),
    );

    await page.goto("/");
    const dialog = await openAssistant(page);

    await dialog.getByRole("textbox", { name: "Votre message" }).fill("Nous avons 4 médecins et tout est sur Excel.");
    await dialog.getByRole("button", { name: "Envoyer le message" }).click();

    // La réponse est affichée, puis le formulaire de coordonnées.
    await expect(thread(dialog).getByText(/je peux transmettre vos coordonnées à un consultant/)).toBeVisible();
    const form = dialog.getByRole("form", { name: "Vos coordonnées" });
    await expect(form).toBeVisible();

    // Le modèle a reçu l'historique et le parcours, jamais d'identité.
    const sent = chatBodies[0] as { messages: { role: string }[]; topicId: string; state: Record<string, boolean> };
    expect(sent.messages.at(-1)?.role).toBe("user");
    expect(sent.topicId).toBe("home");
    expect(sent.state.contactCaptured).toBe(false);

    // Validation côté client : rien ne part sans consentement.
    await form.getByRole("button", { name: "Envoyer mes coordonnées" }).click();
    await expect(form.getByText("Cochez cette case pour que nous puissions traiter votre demande.")).toBeVisible();
    expect(lead.payload).toBeNull();

    await form.getByLabel("Nom et prénom").fill("Awa Koné");
    await form.getByLabel("Organisation").fill("Clinique Test");
    await form.getByLabel("E-mail professionnel").fill("awa@clinique-test.example");
    await form.getByLabel("Téléphone ou WhatsApp").fill("+225 07 00 00 00 00");
    await form.getByRole("checkbox", { name: /J'accepte/ }).check();
    await form.getByRole("button", { name: "Envoyer mes coordonnées" }).click();

    await expect(dialog.getByText("Coordonnées transmises à l'équipe.")).toBeVisible();
    await expect(thread(dialog).getByText(/Merci Awa, vos coordonnées sont bien transmises/)).toBeVisible();

    // Le lead part vers l'API existante, avec l'origine « assistant-ia » et le résumé.
    expect(lead.payload).toMatchObject({
      intent: "demo",
      fromBlock: "assistant-ia",
      name: "Awa Koné",
      organization: "Clinique Test",
      email: "awa@clinique-test.example",
      consent: true,
      honeypot: "",
    });
    expect(String(lead.payload?.message)).toContain("Directeur de clinique, 4 médecins, Excel.");

    // Dernière étape : Calendly, pré-rempli, uniquement après un clic explicite.
    await expect(dialog.locator("iframe")).toHaveCount(0);
    await dialog.getByRole("button", { name: /Choisir un créneau/ }).click();
    const frame = dialog.locator('iframe[title^="Réservation"]');
    await expect(frame).toBeVisible();
    const src = (await frame.getAttribute("src")) ?? "";
    expect(src).toMatch(/^https:\/\/calendly\.com\//);
    expect(src).toContain("name=Awa+Kon");
    expect(src).toContain("email=awa%40clinique-test.example");

    // Un message venu d'une autre origine est ignoré ; celui de Calendly confirme la démo.
    await page.evaluate(() =>
      window.dispatchEvent(
        new MessageEvent("message", { data: { event: "calendly.event_scheduled" }, origin: "https://evil.example" }),
      ),
    );
    await expect(frame).toBeVisible();
    await page.evaluate(() =>
      window.dispatchEvent(
        new MessageEvent("message", { data: { event: "calendly.event_scheduled" }, origin: "https://calendly.com" }),
      ),
    );
    await expect(thread(dialog).getByText(/Votre démonstration est réservée/)).toBeVisible();
    await expect(frame).toHaveCount(0);
  });

  test("si le chat est en panne, le visiteur peut quand même laisser ses coordonnées", async ({ page }) => {
    await page.route("**/api/assistant/chat", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "unavailable" }) }),
    );
    await page.goto("/");
    const dialog = await openAssistant(page);

    await dialog.getByRole("textbox", { name: "Votre message" }).fill("Bonjour, je cherche une GED.");
    await dialog.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(thread(dialog).getByText(/Je rencontre un souci technique/)).toBeVisible();
    await expect(dialog.getByRole("form", { name: "Vos coordonnées" })).toBeVisible();
  });

  test("le panneau ouvert, avec le formulaire de coordonnées, n'a aucune violation d'accessibilité sérieuse", async ({ page }) => {
    await page.route("**/api/assistant/chat", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/x-ndjson",
        body: NDJSON([
          { t: "text", d: "Je peux transmettre vos coordonnées à un consultant." },
          { t: "actions", actions: [{ type: "contact_form", summary: "Résumé de test." }] },
          { t: "done" },
        ]),
      }),
    );
    await page.goto("/");
    const dialog = await openAssistant(page);
    await dialog.getByRole("textbox", { name: "Votre message" }).fill("Bonjour");
    await dialog.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(dialog.getByRole("form", { name: "Vos coordonnées" })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include("#assistant-panel")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
  });

  test("les réponses rapides sont proposées puis retirées une fois utilisées", async ({ page }) => {
    await page.route("**/api/assistant/chat", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/x-ndjson",
        body: NDJSON([
          { t: "text", d: "Combien de médecins exercent chez vous ?" },
          { t: "actions", actions: [{ type: "replies", replies: ["1 à 3", "4 à 10"] }] },
          { t: "done" },
        ]),
      }),
    );
    await page.goto("/");
    const dialog = await openAssistant(page);

    await dialog.getByRole("button", { name: "Santé / clinique" }).click();
    await expect(thread(dialog).getByText("Combien de médecins exercent chez vous ?")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "4 à 10" })).toBeVisible();
    // Les réponses rapides de l'ouverture ont disparu.
    await expect(dialog.getByRole("button", { name: "Immobilier" })).toHaveCount(0);
  });
});
