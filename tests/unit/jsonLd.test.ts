import { describe, it, expect } from "vitest";
import {
  brandedTitle,
  buildMetadata,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPaginationMetadata,
  buildProductJsonLd,
  buildSiteGraphJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";
import type { SiteSettings, SolutionDetail, FaqEntry } from "@/lib/validators/content";

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

describe("site graph (Organization + WebSite)", () => {
  const settings = {
    brand: {
      name: "Alliance Consultants",
      alternateName: "Alliance Computer Consultants",
      tagline: "Éditeur et intégrateur africain de solutions SaaS, IA et métiers.",
      logoUrl: "/images/Logo_AllianceConsultants.png",
      foundingYear: 2003,
    },
    contact: {
      email: "contact@example.com",
      phones: ["+225 01 01 51 01 36", "+225 07 07 66 41 05"],
      whatsapp: null,
      address: { street: "Abidjan, Côte d'Ivoire", city: "Abidjan", country: "CI" },
    },
    social: { linkedin: "https://www.linkedin.com/company/x", facebook: null },
    primaryMenu: [{ label: "Accueil", href: "/" }],
    footerMenu: {},
  } as unknown as SiteSettings;

  const graph = buildSiteGraphJsonLd(settings, SITE);
  const nodes = graph["@graph"] as Array<Record<string, unknown>>;
  const org = nodes.find((n) => n["@id"] === `${SITE}/#organization`)!;
  const website = nodes.find((n) => n["@id"] === `${SITE}/#website`)!;

  it("exposes a single Organization and a single WebSite with stable @id", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(nodes).toHaveLength(2);
    expect(org["@type"]).toEqual(["Organization", "ProfessionalService"]);
    expect(website["@type"]).toBe("WebSite");
  });

  it("links the WebSite to the Organization by @id and no longer claims a site search", () => {
    expect(website.publisher).toEqual({ "@id": `${SITE}/#organization` });
    expect(website.potentialAction).toBeUndefined();
  });

  it("keeps contact data, logo and sameAs on the Organization", () => {
    expect(org.telephone).toBe("+225 01 01 51 01 36");
    expect(org.sameAs).toEqual(["https://www.linkedin.com/company/x"]);
    expect((org.logo as Record<string, unknown>).url).toBe(
      `${SITE}/images/Logo_AllianceConsultants.png`,
    );
  });

  it("makes page-level entities point back to the Organization @id", () => {
    const article = buildArticleJsonLd({
      title: "T",
      description: "D",
      url: `${SITE}/blog/t`,
      publishedAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      organizationName: "Alliance Consultants",
      organizationLogo: `${SITE}/logo.png`,
    });
    expect((article.publisher as Record<string, unknown>)["@id"]).toBe(`${SITE}/#organization`);
    expect((article.author as Record<string, unknown>)["@id"]).toBe(`${SITE}/#organization`);

    const product = buildProductJsonLd(stubSolution, SITE);
    expect((product.manufacturer as Record<string, unknown>)["@id"]).toBe(`${SITE}/#organization`);

    const about = buildWebPageJsonLd({
      type: "AboutPage",
      name: "À propos",
      description: "D",
      url: `${SITE}/a-propos`,
      siteUrl: SITE,
    });
    expect(about.about).toEqual({ "@id": `${SITE}/#organization` });
    expect(about.isPartOf).toEqual({ "@id": `${SITE}/#website` });
  });
});

describe("brandedTitle", () => {
  it("appends the brand when the title is short enough", () => {
    expect(brandedTitle("Formation SQL Server")).toBe("Formation SQL Server | Alliance Consultants");
  });

  it("does not double the brand", () => {
    expect(brandedTitle("Contact & Démo — Alliance Consultants")).toBe(
      "Contact & Démo — Alliance Consultants",
    );
  });

  it("leaves long titles untouched", () => {
    const long = "Comment dématérialiser les archives d'une administration en Afrique francophone";
    expect(brandedTitle(long)).toBe(long);
  });
});

describe("buildPaginationMetadata", () => {
  it("canonicalises each page on itself and links prev/next", () => {
    const m = buildPaginationMetadata({ basePath: "/blog", page: 2, totalPages: 3, siteUrl: SITE });
    expect(m.alternates?.canonical).toBe(`${SITE}/blog?page=2`);
    expect(m.pagination).toEqual({ previous: `${SITE}/blog`, next: `${SITE}/blog?page=3` });
    expect(m.robots).toBeUndefined();
  });

  it("keeps page 1 on the bare path and has no previous link", () => {
    const m = buildPaginationMetadata({ basePath: "/blog", page: 1, totalPages: 2, siteUrl: SITE });
    expect(m.alternates?.canonical).toBe(`${SITE}/blog`);
    expect(m.pagination).toEqual({ previous: null, next: `${SITE}/blog?page=2` });
  });

  it("noindexes a page past the last one", () => {
    const m = buildPaginationMetadata({ basePath: "/blog", page: 9, totalPages: 2, siteUrl: SITE });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.pagination).toEqual({ previous: null, next: null });
  });
});

describe("buildMetadata", () => {
  const meta = buildMetadata({
    title: "MedicPro — Gestion réglementaire",
    description: "Description de test suffisamment longue.",
    ogImage: "/images/solutions/medicpro.svg",
    siteUrl: `${SITE}/solutions/medicpro`,
  });

  it("resolves relative URLs against the site root, not the page path", () => {
    expect(meta.metadataBase?.toString()).toBe(`${SITE}/`);
  });

  it("canonicalises on the page URL and advertises the RSS feed", () => {
    expect(meta.alternates?.canonical).toBe(`${SITE}/solutions/medicpro`);
    expect(meta.alternates?.types).toEqual({ "application/rss+xml": "/feed.xml" });
  });

  it("brands the title consistently for SERP, OpenGraph and Twitter", () => {
    const expected = "MedicPro — Gestion réglementaire | Alliance Consultants";
    expect(meta.title).toEqual({ absolute: expected });
    expect(meta.openGraph?.title).toBe(expected);
    expect(meta.twitter?.title).toBe(expected);
  });
});
