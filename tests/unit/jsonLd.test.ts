import { describe, it, expect } from "vitest";
import {
  buildProductJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import type { SolutionDetail, FaqEntry } from "@/lib/validators/content";

const SITE = "https://allianceconsultants.net";

const stubSolution: SolutionDetail = {
  slug: "medicpro",
  name: "MedicPro",
  category: "Pharma",
  shortDescription: "Solution test pour la gestion réglementaire pharmaceutique multi-marchés.",
  mainBenefit: "Maîtrisez votre suivi réglementaire et anticipez les expirations de visa.",
  homepageOrder: 2,
  showOnHomepage: true,
  externalUrl: null,
  seoTitle: "MedicPro — test",
  seoDescription:
    "MedicPro test description longue de plus de cinquante caractères pour respecter le schéma Zod.",
  ogImage: "/images/solutions/medicpro.svg",
  hero: {
    headline: "Headline test",
    tagline: "Tagline test",
    primaryCta: { label: "Demander une démo", intent: "demo" },
  },
  valueProposition:
    "Proposition de valeur test suffisamment longue pour passer la borne minimale de 60 caractères du schéma SolutionDetailSchema.",
  targetAudience: [
    { label: "A", description: "AA" },
    { label: "B", description: "BB" },
  ],
  problemsSolved: ["P1", "P2", "P3"],
  featureGroups: [
    {
      title: "G1",
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
    { question: "Question un assez longue ?", answer: "Réponse un assez longue ici." },
    { question: "Question deux assez longue ?", answer: "Réponse deux assez longue ici." },
    { question: "Question trois assez longue ?", answer: "Réponse trois assez longue ici." },
  ],
  relatedSolutions: [
    { slug: "cliniquepro", differentiator: "Différenciation test ABCDEFGHIJK." },
    { slug: "docupro-suite", differentiator: "Différenciation test ABCDEFGHIJK." },
  ],
};

describe("buildProductJsonLd", () => {
  const jsonLd = buildProductJsonLd(stubSolution, SITE);

  it("uses Schema.org context and Product type", () => {
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Product");
  });

  it("includes name, description, category, brand and url", () => {
    expect(jsonLd.name).toBe("MedicPro");
    expect(jsonLd.description).toBe(stubSolution.shortDescription);
    expect(jsonLd.category).toBe("Pharma");
    expect(jsonLd.brand).toEqual({ "@type": "Brand", name: "Alliance Consultants" });
    expect(jsonLd.url).toBe("https://allianceconsultants.net/solutions/medicpro");
  });

  it("resolves ogImage against siteUrl when present", () => {
    expect(jsonLd.image).toBe("https://allianceconsultants.net/images/solutions/medicpro.svg");
  });
});

describe("buildFaqJsonLd", () => {
  const faq: FaqEntry[] = stubSolution.faq;
  const jsonLd = buildFaqJsonLd(faq);

  it("uses FAQPage type", () => {
    expect(jsonLd["@type"]).toBe("FAQPage");
  });

  it("maps each entry to a Question with an accepted Answer", () => {
    const entries = jsonLd.mainEntity as Array<Record<string, unknown>>;
    expect(entries).toHaveLength(faq.length);
    for (let i = 0; i < faq.length; i++) {
      expect(entries[i]?.["@type"]).toBe("Question");
      expect(entries[i]?.name).toBe(faq[i]!.question);
      const answer = entries[i]?.acceptedAnswer as Record<string, unknown>;
      expect(answer["@type"]).toBe("Answer");
      expect(answer.text).toBe(faq[i]!.answer);
    }
  });
});

describe("buildBreadcrumbJsonLd", () => {
  const jsonLd = buildBreadcrumbJsonLd({
    slug: "medicpro",
    name: "MedicPro",
    siteUrl: SITE,
  });

  it("uses BreadcrumbList type", () => {
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
  });

  it("contains Accueil → Solutions → solution name in order", () => {
    const items = jsonLd.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0]?.position).toBe(1);
    expect(items[0]?.name).toBe("Accueil");
    expect(items[0]?.item).toBe("https://allianceconsultants.net/");
    expect(items[1]?.position).toBe(2);
    expect(items[1]?.name).toBe("Solutions");
    expect(items[1]?.item).toBe("https://allianceconsultants.net/solutions");
    expect(items[2]?.position).toBe(3);
    expect(items[2]?.name).toBe("MedicPro");
    expect(items[2]?.item).toBe("https://allianceconsultants.net/solutions/medicpro");
  });
});
