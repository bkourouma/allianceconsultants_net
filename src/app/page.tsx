import type { Metadata } from "next";
import { getHomepage, getSiteSettings, getSolutions } from "@/lib/content";
import { buildMetadata, buildOrganizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";
import { Hero } from "@/components/homepage/Hero";
import { SolutionsSection } from "@/components/homepage/SolutionsSection";
import { FinalCTA } from "@/components/homepage/FinalCTA";

const SITE_URL = "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage();
  return buildMetadata({
    title: homepage.seoTitle,
    description: homepage.seoDescription,
    ogImage: homepage.ogImage,
    siteUrl: SITE_URL,
  });
}

export default async function HomePage() {
  const [homepage, settings, solutions] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
    getSolutions({ homepageOnly: true }),
  ]);

  const orgJsonLd = buildOrganizationJsonLd(settings, SITE_URL);

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <Hero hero={homepage.hero} />
      <SolutionsSection sectionMeta={homepage.solutionsSection} solutions={solutions} />
      <FinalCTA finalCta={homepage.finalCta} />
    </>
  );
}
