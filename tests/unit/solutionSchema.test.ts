import { describe, it, expect } from "vitest";
import { SolutionDetailSchema } from "@/lib/validators/content";

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    slug: "medicpro",
    name: "MedicPro",
    category: "Pharma",
    shortDescription: "Description courte de plus de vingt caractères pour Zod.",
    mainBenefit: "Bénéfice principal long.",
    homepageOrder: 2,
    showOnHomepage: true,
    externalUrl: null,
    seoTitle: "MedicPro — page test détail",
    seoDescription:
      "Description SEO suffisamment longue pour respecter la borne minimale de cinquante caractères imposée.",
    ogImage: "/images/solutions/medicpro.svg",
    hero: {
      headline: "Headline conforme au schéma test",
      tagline: "Tagline conforme aussi",
      primaryCta: { label: "Demander une démo", intent: "demo" },
    },
    valueProposition:
      "Proposition de valeur d'au moins soixante caractères pour passer la borne minimale du schéma SolutionDetailSchema.",
    targetAudience: [
      { label: "Cible 1", description: "Description cible 1." },
      { label: "Cible 2", description: "Description cible 2." },
    ],
    problemsSolved: ["P1 long", "P2 long", "P3 long"],
    featureGroups: [
      {
        title: "Groupe 1",
        features: [
          { title: "F1", description: "D1" },
          { title: "F2", description: "D2" },
          { title: "F3", description: "D3" },
        ],
      },
    ],
    benefits: [
      { title: "B1", description: "D1" },
      { title: "B2", description: "D2" },
      { title: "B3", description: "D3" },
    ],
    faq: [
      { question: "Question un assez longue ?", answer: "Réponse un assez longue." },
      { question: "Question deux assez longue ?", answer: "Réponse deux assez longue." },
      { question: "Question trois assez longue ?", answer: "Réponse trois assez longue." },
    ],
    relatedSolutions: [
      { slug: "cliniquepro", differentiator: "Différenciation test ABCDEFGHIJK." },
      { slug: "docupro-suite", differentiator: "Différenciation test ABCDEFGHIJK." },
    ],
    ...overrides,
  };
}

describe("SolutionDetailSchema", () => {
  it("accepts a valid payload", () => {
    const result = SolutionDetailSchema.safeParse(validPayload());
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("requires hero.primaryCta.intent in the allowed enum", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({
        hero: {
          headline: "Headline conforme au schéma test",
          tagline: "Tagline conforme aussi",
          primaryCta: { label: "Demander une démo", intent: "unknown" },
        },
      })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when relatedSolutions has only 1 entry", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({
        relatedSolutions: [
          { slug: "cliniquepro", differentiator: "Différenciation test ABCDEFGHIJK." },
        ],
      })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when targetAudience has only 1 entry", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({
        targetAudience: [{ label: "Cible 1", description: "Description cible 1." }],
      })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when problemsSolved has fewer than 3 entries", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({ problemsSolved: ["P1", "P2"] })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when faq has fewer than 3 entries", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({
        faq: [
          {
            question: "Question seule longue ?",
            answer: "Réponse seule assez longue.",
          },
        ],
      })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when seoDescription is shorter than 50 chars", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({ seoDescription: "trop court" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when valueProposition is shorter than 60 chars", () => {
    const result = SolutionDetailSchema.safeParse(
      validPayload({ valueProposition: "trop court" })
    );
    expect(result.success).toBe(false);
  });
});
