import { describe, it, expect } from "vitest";
import { rankRelatedPostIds, type RelatedCandidate } from "@/lib/blog";
import { parsePostFaq } from "@/lib/blog-faq";
import { BlogPostInputSchema } from "@/lib/validators/blog";
import {
  buildArticleJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  isNominativeAuthor,
} from "@/lib/seo";
import {
  countWords,
  faqToText,
  readingMinutesFromHtml,
} from "@/components/blog/post-utils";
import type { SiteSettings } from "@/lib/validators/content";

const day = (n: number) => new Date(Date.UTC(2026, 0, n));

describe("rankRelatedPostIds (À lire ensuite)", () => {
  // Tags larges (solutions, services, formations) + tags thématiques (ged, sante…).
  const population: RelatedCandidate[] = [
    { id: "archivage", publishedAt: day(1), tagSlugs: ["formations", "ged"] },
    { id: "demat-1", publishedAt: day(2), tagSlugs: ["services", "ged"] },
    { id: "demat-2", publishedAt: day(3), tagSlugs: ["services", "ged"] },
    { id: "ged-docupro", publishedAt: day(4), tagSlugs: ["solutions", "ged"] },
    { id: "sante-1", publishedAt: day(10), tagSlugs: ["solutions", "sante"] },
    { id: "sante-2", publishedAt: day(11), tagSlugs: ["solutions", "sante"] },
    { id: "immo", publishedAt: day(12), tagSlugs: ["solutions", "immobilier"] },
    { id: "dev", publishedAt: day(13), tagSlugs: ["services", "developpement"] },
  ];

  it("propose des articles de la même thématique avant les plus récents", () => {
    const ids = rankRelatedPostIds("demat-1", ["services", "ged"], population, 3);
    expect(ids).toHaveLength(3);
    expect(ids).toEqual(expect.arrayContaining(["demat-2"]));
    for (const id of ids) {
      expect(["archivage", "demat-2", "ged-docupro"]).toContain(id);
    }
  });

  it("ne renvoie jamais l'article courant ni de doublon", () => {
    const ids = rankRelatedPostIds("archivage", ["formations", "ged"], population, 3);
    expect(ids).not.toContain("archivage");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("complète avec les plus récents quand la thématique est trop petite", () => {
    const ids = rankRelatedPostIds("dev", ["services", "developpement"], population, 3);
    expect(ids).toHaveLength(3);
    // « services » est partagé avec demat-1 et demat-2 ; le dernier vient du repli récent.
    expect(ids.slice(0, 2).sort()).toEqual(["demat-1", "demat-2"]);
    expect(ids[2]).toBe("immo");
  });

  it("sans tag, retombe sur les articles les plus récents", () => {
    const ids = rankRelatedPostIds("x", [], population, 3);
    expect(ids).toEqual(["dev", "immo", "sante-2"]);
  });
});

describe("temps de lecture", () => {
  const words = (n: number) => `<p>${Array.from({ length: n }, () => "mot").join(" ")}</p>`;
  it("suit le vrai nombre de mots", () => {
    expect(countWords(words(440))).toBe(440);
    expect(readingMinutesFromHtml(words(100))).toBe(1);
    expect(readingMinutesFromHtml(words(440))).toBe(2);
    expect(readingMinutesFromHtml(words(1200))).toBe(6);
    expect(readingMinutesFromHtml(words(1800))).toBe(9);
  });
  it("compte aussi la FAQ", () => {
    const faq = [{ question: "Une question assez longue ?", answer: "Une réponse tout aussi longue." }];
    expect(countWords(words(10), faqToText(faq))).toBe(10 + 10);
  });
});

describe("FAQ d'article", () => {
  it("ignore les entrées invalides", () => {
    const faq = parsePostFaq([
      { question: "Question valable pour le test ?", answer: "Réponse valable pour le test." },
      { question: "courte", answer: "x" },
      "n'importe quoi",
    ]);
    expect(faq).toHaveLength(1);
    expect(parsePostFaq(null)).toEqual([]);
    expect(parsePostFaq({ question: "a" })).toEqual([]);
  });

  it("alimente le gabarit FAQPage des pages produit", () => {
    const jsonLd = buildFaqJsonLd(
      parsePostFaq([
        { question: "Question valable pour le test ?", answer: "Réponse valable pour le test." },
      ]),
    );
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect((jsonLd.mainEntity as unknown[]).length).toBe(1);
  });

  it("est acceptée par le validateur d'article de l'API", () => {
    const base = {
      title: "Un titre d'article assez long",
      excerpt: "Un résumé suffisamment long pour passer la borne minimale de soixante caractères.",
      bodyHtml: `<p>${"mot ".repeat(60)}</p>`,
      tags: [],
    };
    const ok = BlogPostInputSchema.safeParse({
      ...base,
      faq: [{ question: "Question valable pour le test ?", answer: "Réponse valable pour le test." }],
    });
    expect(ok.success).toBe(true);
    expect(BlogPostInputSchema.safeParse({ ...base, faq: null }).success).toBe(true);
    expect(BlogPostInputSchema.safeParse({ ...base, faq: [{ question: "a", answer: "b" }] }).success).toBe(false);
  });
});

describe("buildArticleJsonLd", () => {
  const args = {
    title: "Titre",
    description: "Description",
    url: "https://allianceconsultants.net/blog/x",
    publishedAt: day(1),
    updatedAt: day(5),
    organizationName: "Alliance Consultants",
    organizationLogo: "https://allianceconsultants.net/images/logo.png",
  };

  it("a un auteur Organization quand aucun auteur nominatif n'existe", () => {
    for (const authorName of [null, undefined, "Admin Alliance"]) {
      const j = buildArticleJsonLd({ ...args, authorName });
      expect(j.author).toEqual({ "@type": "Organization", name: "Alliance Consultants" });
    }
  });

  it("garde un auteur nominatif", () => {
    expect(isNominativeAuthor("Awa Koné")).toBe(true);
    const j = buildArticleJsonLd({ ...args, authorName: "Awa Koné" });
    expect(j.author).toEqual({ "@type": "Person", name: "Awa Koné" });
  });

  it("publie dates réelles et image (repli : logo)", () => {
    const j = buildArticleJsonLd(args);
    expect(j.datePublished).toBe(day(1).toISOString());
    expect(j.dateModified).toBe(day(5).toISOString());
    expect(j.image).toEqual([args.organizationLogo]);
    const withImage = buildArticleJsonLd({ ...args, image: "https://allianceconsultants.net/a.jpg" });
    expect(withImage.image).toEqual(["https://allianceconsultants.net/a.jpg"]);
  });

  it("ne publie jamais une modification antérieure à la publication", () => {
    const j = buildArticleJsonLd({ ...args, updatedAt: day(0) });
    expect(j.dateModified).toBe(day(1).toISOString());
  });
});

describe("buildOrganizationJsonLd", () => {
  const settings = {
    brand: { name: "Alliance Consultants", tagline: "Éditeur de solutions.", logoUrl: "/logo.png", foundingYear: 2003 },
    contact: {
      email: "info@example.net",
      phones: ["+225 01 02 03 04 05"],
      address: { street: "Abidjan, Côte d'Ivoire", city: "Abidjan", country: "CI" },
    },
    social: { linkedin: "https://www.linkedin.com/company/x", facebook: null },
  } as unknown as SiteSettings;

  it("reprend sameAs, adresse et téléphone du dépôt, avec la même URL racine que la canonical", () => {
    const j = buildOrganizationJsonLd(settings, "https://allianceconsultants.net");
    expect(j.url).toBe("https://allianceconsultants.net");
    expect(j.sameAs).toEqual(["https://www.linkedin.com/company/x"]);
    expect(j.telephone).toBe("+225 01 02 03 04 05");
    expect(j.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "Abidjan",
      addressCountry: "CI",
    });
  });
});
