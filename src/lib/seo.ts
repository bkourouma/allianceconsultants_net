import type { Metadata } from "next";
import type {
  SiteSettings,
  SolutionDetail,
  FaqEntry,
} from "./validators/content";

export function buildMetadata({
  title,
  description,
  ogImage,
  siteUrl,
}: {
  title: string;
  description: string;
  ogImage?: string;
  siteUrl: string;
}): Metadata {
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "Alliance Consultants",
      locale: "fr_FR",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...(googleVerification || bingVerification
      ? {
          verification: {
            ...(googleVerification ? { google: googleVerification } : {}),
            ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
          },
        }
      : {}),
  };
}

// ============================================================================
// JSON-LD helpers — Site-wide (WebSite + LocalBusiness)
// ============================================================================

/**
 * Racine du site SANS « / » final, comme la balise canonical de l'accueil
 * (Next.js écrit toujours la canonical de la racine sans slash, comme celles
 * de toutes les autres pages) : ainsi canonical, JSON-LD et og:url disent
 * la même chose.
 */
function rootUrl(siteUrl: string): string {
  return new URL("/", siteUrl).origin;
}

/**
 * Adresse postale à partir des seules données du dépôt (site-settings.json).
 * `street` ne contient aujourd'hui que « Abidjan, Côte d'Ivoire » : tant que
 * ce n'est pas une vraie rue, on ne le publie pas comme `streetAddress`.
 */
function buildPostalAddress(settings: SiteSettings): Record<string, unknown> {
  const { street, city, country } = settings.contact.address;
  const streetRepeatsCity = street.toLowerCase().includes(city.toLowerCase());
  return {
    "@type": "PostalAddress",
    ...(streetRepeatsCity ? {} : { streetAddress: street }),
    addressLocality: city,
    addressCountry: country,
  };
}

export function buildWebSiteJsonLd(siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Alliance Consultants",
    url: rootUrl(siteUrl),
    inLanguage: "fr-FR",
    publisher: {
      "@type": "Organization",
      "@id": `${rootUrl(siteUrl)}#organization`,
      name: "Alliance Consultants",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildLocalBusinessJsonLd(
  settings: SiteSettings,
  siteUrl: string,
): Record<string, unknown> {
  const sameAs = [
    settings.social.linkedin,
    settings.social.facebook,
    settings.social.youtube,
    settings.social.x,
  ].filter((u): u is string => Boolean(u));

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${rootUrl(siteUrl)}#localbusiness`,
    name: settings.brand.name,
    description: settings.brand.tagline,
    url: rootUrl(siteUrl),
    image: new URL(settings.brand.logoUrl, siteUrl).toString(),
    logo: new URL(settings.brand.logoUrl, siteUrl).toString(),
    telephone: settings.contact.phones[0],
    email: settings.contact.email,
    priceRange: "$$",
    address: buildPostalAddress(settings),
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildServiceJsonLd({
  name,
  description,
  url,
  serviceType,
  image,
  siteUrl,
}: {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
  image?: string;
  siteUrl: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    ...(serviceType ? { serviceType } : {}),
    ...(image ? { image } : {}),
    provider: {
      "@type": "Organization",
      name: "Alliance Consultants",
      url: siteUrl,
    },
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    availableLanguage: ["fr"],
  };
}

export function buildOrganizationJsonLd(
  settings: SiteSettings,
  siteUrl: string
): Record<string, unknown> {
  const sameAs = [
    settings.social.linkedin,
    settings.social.facebook,
    settings.social.youtube,
    settings.social.x,
  ].filter((u): u is string => Boolean(u));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${rootUrl(siteUrl)}#organization`,
    name: settings.brand.name,
    alternateName: settings.brand.alternateName ?? "Alliance Computer Consultants",
    url: rootUrl(siteUrl),
    logo: new URL(settings.brand.logoUrl, siteUrl).toString(),
    description: settings.brand.tagline,
    foundingDate: String(settings.brand.foundingYear),
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    address: buildPostalAddress(settings),
    telephone: settings.contact.phones[0],
    email: settings.contact.email,
    contactPoint: settings.contact.phones.map((telephone, index) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone,
      ...(index === 0 ? { email: settings.contact.email } : {}),
      availableLanguage: ["French"],
    })),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

// ============================================================================
// JSON-LD helpers — Pages détaillées des solutions corporate
// (feature 001-pages-corporate-solutions)
// ============================================================================

export function buildProductJsonLd(
  solution: SolutionDetail,
  siteUrl: string
): Record<string, unknown> {
  const url = new URL(`/solutions/${solution.slug}`, siteUrl).toString();
  const image = solution.ogImage
    ? new URL(solution.ogImage, siteUrl).toString()
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: solution.name,
    description: solution.shortDescription,
    category: solution.category,
    brand: {
      "@type": "Brand",
      name: "Alliance Consultants",
    },
    url,
    ...(image ? { image } : {}),
  };
}

export function buildFaqJsonLd(faq: FaqEntry[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd({
  slug,
  name,
  siteUrl,
}: {
  slug: string;
  name: string;
  siteUrl: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: new URL("/", siteUrl).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Solutions",
        item: new URL("/solutions", siteUrl).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: new URL(`/solutions/${slug}`, siteUrl).toString(),
      },
    ],
  };
}

// ============================================================================
// JSON-LD helpers — Blog (feature 002-backoffice-blog)
// ============================================================================

/**
 * Les comptes d'administration du blog (« Admin Alliance »…) ne sont pas des
 * auteurs éditoriaux : on ne les publie pas comme `Person` dans le JSON-LD.
 */
export function isNominativeAuthor(name?: string | null): name is string {
  const n = name?.trim();
  if (!n) return false;
  return !/(admin|alliance|consultants|équipe|equipe|rédaction|redaction)/i.test(n);
}

export function buildArticleJsonLd({
  title,
  description,
  url,
  image,
  publishedAt,
  updatedAt,
  authorName,
  organizationName,
  organizationLogo,
  organizationUrl,
  wordCount,
  keywords,
}: {
  title: string;
  description: string;
  url: string;
  /** URL absolue de l'image principale ; à défaut, le logo de l'organisation. */
  image?: string;
  publishedAt: Date;
  /** Dernière modification réelle de l'article (colonne `updatedAt`). */
  updatedAt: Date;
  /** Auteur nominatif ; sans lui, l'auteur est l'organisation. */
  authorName?: string | null;
  organizationName: string;
  organizationLogo: string;
  organizationUrl?: string;
  wordCount?: number;
  keywords?: string[];
}): Record<string, unknown> {
  const organization = {
    "@type": "Organization",
    name: organizationName,
    ...(organizationUrl ? { url: organizationUrl } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "fr-FR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: [image ?? organizationLogo],
    datePublished: publishedAt.toISOString(),
    dateModified: (updatedAt < publishedAt ? publishedAt : updatedAt).toISOString(),
    ...(wordCount ? { wordCount } : {}),
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
    author: isNominativeAuthor(authorName)
      ? { "@type": "Person", name: authorName.trim() }
      : organization,
    publisher: {
      ...organization,
      logo: { "@type": "ImageObject", url: organizationLogo },
    },
  };
}

export function buildBlogBreadcrumbJsonLd({
  siteUrl,
  postTitle,
  postSlug,
}: {
  siteUrl: string;
  postTitle?: string;
  postSlug?: string;
}): Record<string, unknown> {
  const items: Record<string, unknown>[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: new URL("/", siteUrl).toString(),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: new URL("/blog", siteUrl).toString(),
    },
  ];
  if (postTitle && postSlug) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: postTitle,
      item: new URL(`/blog/${postSlug}`, siteUrl).toString(),
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

// ============================================================================
// JSON-LD helpers — Module Références (cas clients persistés en DB)
// ============================================================================

export function buildReferencesBreadcrumbJsonLd({
  siteUrl,
  referenceId,
  referenceTitle,
}: {
  siteUrl: string;
  referenceId?: string;
  referenceTitle?: string;
}): Record<string, unknown> {
  const items: Record<string, unknown>[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: new URL("/", siteUrl).toString(),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Références",
      item: new URL("/references", siteUrl).toString(),
    },
  ];
  if (referenceId && referenceTitle) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: referenceTitle,
      item: new URL(`/references/${referenceId}`, siteUrl).toString(),
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function buildCaseStudyJsonLd({
  id,
  companyName,
  projectTitle,
  year,
  problem,
  solution,
  impact,
  siteUrl,
  organizationName,
  organizationLogo,
  updatedAt,
}: {
  id: string;
  companyName: string;
  projectTitle: string;
  year: string;
  problem: string;
  solution: string;
  impact?: string | null;
  siteUrl: string;
  organizationName: string;
  organizationLogo: string;
  updatedAt: Date;
}): Record<string, unknown> {
  const url = new URL(`/references/${id}`, siteUrl).toString();
  const description = truncateOneLine(
    [problem, solution, impact].filter(Boolean).join(" — "),
    300,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${companyName} — ${projectTitle}`,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished: extractIsoDate(year, updatedAt),
    dateModified: updatedAt.toISOString(),
    about: {
      "@type": "Organization",
      name: companyName,
    },
    author: {
      "@type": "Organization",
      name: organizationName,
    },
    publisher: {
      "@type": "Organization",
      name: organizationName,
      logo: { "@type": "ImageObject", url: organizationLogo },
    },
  };
}

function truncateOneLine(input: string, max: number): string {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

function extractIsoDate(yearText: string, fallback: Date): string {
  const m = yearText.match(/\b(19|20)\d{2}\b/);
  if (m) {
    return new Date(`${m[0]}-01-01T00:00:00.000Z`).toISOString();
  }
  return fallback.toISOString();
}
