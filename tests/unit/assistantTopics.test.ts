import { describe, it, expect } from "vitest";
import {
  getAllSolutionDetailSlugs,
  getAllServiceSlugs,
  getAllTrainingSlugs,
  getAssistantConfig,
} from "@/lib/content";
import { resolveTopic, toPublicTopic } from "@/lib/assistant/topics";
import { buildContextBlock, buildStablePrompt } from "@/lib/assistant/prompt";
import { getKnowledgeBase } from "@/lib/assistant/knowledge";

describe("content/assistant.json", () => {
  it("couvre chaque solution, service et formation publiés", async () => {
    const [config, solutions, services, trainings] = await Promise.all([
      getAssistantConfig(),
      getAllSolutionDetailSlugs(),
      getAllServiceSlugs(),
      getAllTrainingSlugs(),
    ]);
    const ids = new Set(config.topics.map((t) => t.id));
    for (const slug of solutions) expect(ids, `solutions/${slug}`).toContain(`solutions/${slug}`);
    for (const slug of services) expect(ids, `services/${slug}`).toContain(`services/${slug}`);
    for (const slug of trainings) expect(ids, `formations/${slug}`).toContain(`formations/${slug}`);
  });

  it("a une URL Calendly valide ou null", async () => {
    const { calendlyUrl } = await getAssistantConfig();
    if (calendlyUrl !== null) expect(calendlyUrl).toMatch(/^https:\/\/calendly\.com\//);
  });
});

describe("resolveTopic", () => {
  it("préfère le sujet exact, puis la rubrique, puis « default »", async () => {
    const config = await getAssistantConfig();
    expect(resolveTopic(config, "solutions/cliniquepro").label).toBe("CliniquePro");
    expect(resolveTopic(config, "solutions/une-solution-future").id).toBe("solutions");
    expect(resolveTopic(config, "blog/mon-article").id).toBe("blog");
    expect(resolveTopic(config, "contact-demo").id).toBe("default");
  });

  it("ne transmet jamais l'axe de découverte au navigateur", async () => {
    const config = await getAssistantConfig();
    for (const topic of config.topics) {
      expect(toPublicTopic(topic)).not.toHaveProperty("focus");
    }
  });
});

describe("prompt et base de connaissances", () => {
  it("n'embarque aucun chiffre non validé (PRODUCT.md)", async () => {
    const kb = await getKnowledgeBase();
    expect(kb).not.toMatch(/\d+\s?%/);
    expect(kb).not.toMatch(/x10|plus vite/i);
    expect(kb).toContain("/solutions/cliniquepro");
    expect(kb).toContain("/services/dematerialisation-archives");
  });

  it("garde la partie stable du prompt indépendante du visiteur (cache de prompt)", async () => {
    const kb = await getKnowledgeBase();
    const a = buildStablePrompt("Assistant Alliance", kb);
    const b = buildStablePrompt("Assistant Alliance", kb);
    expect(a).toBe(b);
    expect(a).toContain("JAMAIS");
    expect(a).not.toMatch(/visiteur a RÉSERVÉ|prénom :/);
  });

  it("pousse vers les coordonnées après plusieurs échanges, et jamais si elles sont recueillies", async () => {
    const config = await getAssistantConfig();
    const topic = resolveTopic(config, "solutions/medicpro");
    const base = {
      messages: [{ role: "user" as const, content: "x" }],
      topicId: topic.id,
      journey: [],
    };
    const noState = { contactFormShown: false, contactCaptured: false, bookingShown: false, bookingDone: false };
    const pushed = buildContextBlock({
      request: { ...base, state: noState },
      topic,
      journey: [],
      opener: null,
      userMessageCount: 5,
    });
    expect(pushed).toContain("propose maintenant de laisser ses coordonnées");

    const captured = buildContextBlock({
      request: { ...base, state: { ...noState, contactCaptured: true, contactFirstName: "Awa" } },
      topic,
      journey: [],
      opener: null,
      userMessageCount: 5,
    });
    expect(captured).toContain("DÉJÀ recueillies (prénom : Awa)");
    expect(captured).not.toContain("propose maintenant de laisser ses coordonnées");
  });
});
