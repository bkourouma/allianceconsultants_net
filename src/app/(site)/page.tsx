import type { Metadata } from "next";
import { getHomepage, getSiteSettings, getSolutions, getServices, getTrainings, getReferences } from "@/lib/content";
import { listLatestPublishedProjectReferences } from "@/lib/projectReferences";
import { listPublishedPostsBySlugs } from "@/lib/blog";
import {
  buildMetadata,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildLocalBusinessJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";
import { Hero } from "@/components/homepage/Hero";
import { SolutionsSection } from "@/components/homepage/SolutionsSection";
import { AISection } from "@/components/homepage/AISection";
import { TrainingsSection } from "@/components/homepage/TrainingsSection";
import { ServicesSection } from "@/components/homepage/ServicesSection";
import { GuidesSection } from "@/components/homepage/GuidesSection";
import { ReferencesSection } from "@/components/homepage/ReferencesSection";
import { TechMethodSection } from "@/components/homepage/TechMethodSection";
import { FinalCTA } from "@/components/homepage/FinalCTA";

const SITE_URL = "https://allianceconsultants.net";

// Les articles de la section « guides » viennent de la base : on régénère la
// page régulièrement (le build Docker n'a pas accès à la base).
export const revalidate = 300;

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
  const homepage = await getHomepage();
  const [
    settings,
    solutions,
    services,
    trainings,
    references,
    projectReferences,
    guidePosts,
  ] = await Promise.all([
    getSiteSettings(),
    getSolutions({ homepageOnly: true }),
    getServices({ homepageOnly: true }),
    getTrainings({ homepageOnly: true }),
    getReferences({ validatedOnly: true }),
    // En cas d'indisponibilité de la DB (preview, build sans Postgres),
    // on dégrade gracieusement vers une liste vide.
    listLatestPublishedProjectReferences(6).catch(() => []),
    // Même chose pour les guides : sans base, la section est simplement omise.
    homepage.guidesSection
      ? listPublishedPostsBySlugs(homepage.guidesSection.slugs).catch(() => [])
      : [],
  ]);

  const orgJsonLd = buildOrganizationJsonLd(settings, SITE_URL);
  const websiteJsonLd = buildWebSiteJsonLd(SITE_URL);
  const localBusinessJsonLd = buildLocalBusinessJsonLd(settings, SITE_URL);

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={localBusinessJsonLd} />

      {/* US1 — Hero principal */}
      <Hero hero={homepage.hero} />

      {/* US2 — Solutions SaaS métiers */}
      <SolutionsSection sectionMeta={homepage.solutionsSection} solutions={solutions} />

      {/* US3 — IA & Automatisation */}
      <AISection aiSection={homepage.aiSection} />

      {/* US4 — Formations */}
      <TrainingsSection trainingsSection={homepage.trainingsSection} trainings={trainings} />

      {/* US5 — Services experts */}
      <ServicesSection services={services} />

      {/* Guides — articles qui répondent aux recherches des visiteurs */}
      {homepage.guidesSection ? (
        <GuidesSection guidesSection={homepage.guidesSection} posts={guidePosts} />
      ) : null}

      {/* US6 — Références & crédibilité */}
      <ReferencesSection
        referencesSection={homepage.referencesSection}
        references={references}
        projectReferences={projectReferences}
      />

      {/* US6 — Stack technique & méthode */}
      <TechMethodSection techSection={homepage.techSection} />

      {/* US7 — CTA final */}
      <FinalCTA finalCta={homepage.finalCta} />
    </>
  );
}
