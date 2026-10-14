import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { StubCTA } from "@/components/services/StubCTA";
import { AcademyPass } from "@/components/formations/AcademyPass";
import { FormationExplorer } from "@/components/formations/FormationExplorer";
import { getTrainings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Nos formations — Alliance Consultants",
      description:
        "Formations professionnelles en IA, automatisation, développement, gestion de projet et SQL Server, en présentiel, distanciel ou intra-entreprise.",
      siteUrl: `${SITE_URL}/formations`,
    }),
    alternates: { canonical: `${SITE_URL}/formations` },
  };
}

export default async function FormationsIndexPage() {
  const trainings = await getTrainings();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Formations",
        item: `${SITE_URL}/formations`,
      },
    ],
  };

  return (
    <div className="line-academie">
      <JsonLd data={breadcrumb} />

      <section className="pb-10 pt-4 md:pb-14">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div>
            <Breadcrumb
              items={[{ label: "Accueil", href: "/" }, { label: "Formations" }]}
            />
            <h1 className="t-display mt-6 max-w-[15ch] text-ink md:mt-10">
              L&apos;Académie : des formations pour vos équipes
            </h1>
            <p className="t-lead mt-6">
              Programmes professionnels en intelligence artificielle,
              automatisation, développement, gestion de projet et bases de
              données, disponibles en présentiel, distanciel ou
              intra-entreprise.
            </p>
          </div>
          <AcademyPass className="hidden pt-6 lg:block" />
        </div>
      </section>

      <section aria-label="Liste des formations" className="pb-16 md:pb-24">
        <div className="wrap">
          {trainings.length === 0 ? (
            <p className="text-ink-soft">
              Aucune formation disponible pour le moment.
            </p>
          ) : (
            <FormationExplorer
              trainings={trainings.map((t) => ({
                slug: t.slug,
                title: t.title,
                shortDescription: t.shortDescription,
                category: t.category,
                modalities: t.modalities,
              }))}
            />
          )}
        </div>
      </section>

      <div className="pb-16 md:pb-24">
        <div className="wrap">
          <StubCTA
            titleId="formations-cta-title"
            title="Inscrivez vos équipes à la bonne formation."
            caption="Pass à détacher"
            actions={
              <CTAButton
                intent="training"
                label="Demander un devis / S'inscrire"
                block="training-section"
                size="md"
                className="h-auto min-h-12 w-full px-4 py-2 text-center leading-tight"
              />
            }
          >
            Programme et tarifs sur demande : dites-nous votre besoin et la
            modalité qui vous convient.
          </StubCTA>
        </div>
      </div>
    </div>
  );
}
