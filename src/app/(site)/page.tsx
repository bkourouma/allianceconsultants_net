import type { Metadata } from "next";
import { getHomepage, getSiteSettings, getSolutions, getServices, getTrainings, getReferences } from "@/lib/content";
import { listLatestPublishedProjectReferences } from "@/lib/projectReferences";
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
import { ReferencesSection } from "@/components/homepage/ReferencesSection";
import { TechMethodSection } from "@/components/homepage/TechMethodSection";
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
  const [
    homepage,
    settings,
    solutions,
    services,
    trainings,
    references,
    projectReferences,
  ] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
    getSolutions({ homepageOnly: true }),
    getServices({ homepageOnly: true }),
    getTrainings({ homepageOnly: true }),
    getReferences({ validatedOnly: true }),
    // En cas d'indisponibilité de la DB (preview, build sans Postgres),
    // on dégrade gracieusement vers une liste vide.
    listLatestPublishedProjectReferences(6).catch(() => []),
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
