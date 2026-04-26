import type { Metadata } from "next";
import { getHomepage, getSiteSettings, getSolutions, getServices, getTrainings, getReferences } from "@/lib/content";
import { buildMetadata, buildOrganizationJsonLd } from "@/lib/seo";
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
  const [homepage, settings, solutions, services, trainings, references] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
    getSolutions({ homepageOnly: true }),
    getServices({ homepageOnly: true }),
    getTrainings({ homepageOnly: true }),
    getReferences({ validatedOnly: true }),
  ]);

  const orgJsonLd = buildOrganizationJsonLd(settings, SITE_URL);

  return (
    <>
      <JsonLd data={orgJsonLd} />

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
      <ReferencesSection referencesSection={homepage.referencesSection} references={references} />

      {/* US6 — Stack technique & méthode */}
      <TechMethodSection techSection={homepage.techSection} />

      {/* US7 — CTA final */}
      <FinalCTA finalCta={homepage.finalCta} />
    </>
  );
}
