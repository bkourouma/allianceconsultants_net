import type { Metadata } from "next";
import type {
  SiteSettings,
  SolutionDetail,
  FaqEntry,
} from "./validators/content";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const BRAND_NAME = "Alliance Consultants";

/** Découverte automatique du flux RSS du blog (`<link rel="alternate">`). */
export const RSS_ALTERNATE = { "application/rss+xml": "/feed.xml" } as const;

/** Longueur maximale d'un `<title>` auquel on accepte d'ajouter la marque. */
const BRANDED_TITLE_MAX = 72;

/**
 * Ajoute « | Alliance Consultants » au titre quand c'est utile : on ne double
 * pas la marque si elle y figure déjà, et on ne rallonge pas un titre déjà long
 * (les moteurs tronquent autour de 60 caractères, la marque passe en dernier).
 */
export function brandedTitle(title: string): string {
  if (title.toLowerCase().includes(BRAND_NAME.toLowerCase())) return title;
  const branded = `${title} | ${BRAND_NAME}`;
  return branded.length <= BRANDED_TITLE_MAX ? branded : title;
}

export function buildMetadata({
  title,
  description,
  ogImage,
  siteUrl,
}: {
  title: string;
  description: string;
  ogImage?: string;
  /** URL canonique de la page (pas celle du site). */
  siteUrl: string;
}): Metadata {
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  const fullTitle = brandedTitle(title);

  return {
    title: { absolute: fullTitle },
    description,
    // Racine du site, pas l'URL de la page : sinon les chemins relatifs (images
    // OpenGraph, lien RSS) seraient résolus sous le chemin de la page.
    metadataBase: new URL("/", siteUrl),
    openGraph: {
      title: fullTitle,
      description,
      url: siteUrl,
      siteName: BRAND_NAME,
      locale: "fr_FR",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: siteUrl,
      types: RSS_ALTERNATE,
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

/**
 * Métadonnées d'une liste paginée (`?page=N`) : chaque page se canonicalise
 * elle-même (la page 2 n'est pas un doublon de la page 1), expose
 * `rel="prev"`/`rel="next"` et reste hors index si la page demandée dépasse
 * la dernière.
 */
export function buildPaginationMetadata({
  basePath,
  page,
  totalPages,
  siteUrl = SITE_URL,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  siteUrl?: string;
}): Pick<Metadata, "alternates" | "pagination" | "robots"> {
  const urlFor = (p: number) =>
    `${siteUrl}${basePath}${p > 1 ? `?page=${p}` : ""}`;
  const outOfRange = page > totalPages;

  return {
    alternates: { canonical: urlFor(page), types: RSS_ALTERNATE },
    pagination: {
      previous: page > 1 && !outOfRange ? urlFor(page - 1) : null,
      next: page < totalPages ? urlFor(page + 1) : null,
    },
    ...(outOfRange ? { robots: { index: false, follow: true } } : {}),
  };
}

// ============================================================================
// JSON-LD — graphe d'entités du site
//
// Une seule entité « Organization » (@id stable) et un seul « WebSite », émis
// par le layout du site sur chaque page. Les autres blocs JSON-LD y renvoient
// par leur @id (publisher, provider, about…) au lieu de recréer une
// organisation anonyme : moteurs et LLM voient ainsi une seule entité.
// ============================================================================

export function organizationId(siteUrl: string = SITE_URL): string {
  return new URL("/#organization", siteUrl).toString();
}

export function websiteId(siteUrl: string = SITE_URL): string {
  return new URL("/#website", siteUrl).toString();
}

/** Renvoi vers l'organisation du site, auto-suffisant (id + nom). */
export function organizationRef(
  siteUrl: string = SITE_URL,
  name: string = BRAND_NAME,
): Record<string, unknown> {
  return { "@type": "Organization", "@id": organizationId(siteUrl), name };
}

export function buildOrganizationJsonLd(
  settings: SiteSettings,
  siteUrl: string,
): Record<string, unknown> {
  const sameAs = [
    settings.social.linkedin,
    settings.social.facebook,
    settings.social.youtube,
    settings.social.x,
  ].filter((u): u is string => Boolean(u));
  const logoUrl = new URL(settings.brand.logoUrl, siteUrl).toString();

  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": organizationId(siteUrl),
    name: settings.brand.name,
    alternateName: settings.brand.alternateName ?? "Alliance Computer Consultants",
    url: siteUrl,
    description: settings.brand.tagline,
    logo: {
      "@type": "ImageObject",
      "@id": new URL("/#logo", siteUrl).toString(),
      url: logoUrl,
      contentUrl: logoUrl,
    },
    image: logoUrl,
    foundingDate: String(settings.brand.foundingYear),
    telephone: settings.contact.phones[0],
    email: settings.contact.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.address.street,
      addressLocality: settings.contact.address.city,
      addressCountry: settings.contact.address.country,
    },
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    contactPoint: settings.contact.phones.map((telephone, index) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone,
      ...(index === 0 ? { email: settings.contact.email } : {}),
      availableLanguage: ["French"],
    })),
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

export function buildWebSiteJsonLd(
  settings: SiteSettings,
  siteUrl: string,
): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: settings.brand.name,
    url: siteUrl,
    inLanguage: "fr-FR",
    publisher: { "@id": organizationId(siteUrl) },
  };
}

/** Graphe commun à toutes les pages publiques : Organization + WebSite. */
export function buildSiteGraphJsonLd(
  settings: SiteSettings,
  siteUrl: string = SITE_URL,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(settings, siteUrl),
      buildWebSiteJsonLd(settings, siteUrl),
    ],
  };
}

/** Page « À propos » / « Contact » rattachée au site et à l'organisation. */
export function buildWebPageJsonLd({
  type,
  name,
  description,
  url,
  siteUrl = SITE_URL,
}: {
  type: "AboutPage" | "ContactPage";
  name: string;
  description: string;
  url: string;
  siteUrl?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    name,
    description,
    url,
    inLanguage: "fr-FR",
    isPartOf: { "@id": websiteId(siteUrl) },
    about: { "@id": organizationId(siteUrl) },
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
    provider: { ...organizationRef(siteUrl), url: siteUrl },
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    availableLanguage: ["fr"],
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
    manufacturer: organizationRef(siteUrl),
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
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: Date;
  updatedAt: Date;
  authorName?: string | null;
  organizationName: string;
  organizationLogo: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(image ? { image: [image] } : {}),
    datePublished: publishedAt.toISOString(),
    dateModified: updatedAt.toISOString(),
    author: authorName
      ? { "@type": "Person", name: authorName }
      : organizationRef(SITE_URL, organizationName),
    publisher: {
      ...organizationRef(SITE_URL, organizationName),
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
    author: organizationRef(siteUrl, organizationName),
    publisher: {
      ...organizationRef(siteUrl, organizationName),
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
