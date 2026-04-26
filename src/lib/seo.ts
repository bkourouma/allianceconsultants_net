import type { Metadata } from "next";
import type { SiteSettings } from "./validators/content";

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
    name: settings.brand.name,
    alternateName: settings.brand.alternateName ?? "Alliance Computer Consultants",
    url: siteUrl,
    logo: new URL(settings.brand.logoUrl, siteUrl).toString(),
    description: settings.brand.tagline,
    foundingDate: String(settings.brand.foundingYear),
    areaServed: [
      { "@type": "Place", name: "Côte d'Ivoire" },
      { "@type": "Place", name: "Afrique francophone" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.address.street,
      addressLocality: settings.contact.address.city,
      addressCountry: settings.contact.address.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: settings.contact.email,
        telephone: settings.contact.phone,
        availableLanguage: ["French"],
      },
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
