import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { Terminus } from "@/components/services/Terminus";
import { AcademyArt } from "@/components/formations/AcademyArt";
import { FormationExplorer } from "@/components/formations/FormationExplorer";
import { getTrainings } from "@/lib/content";
import { ACADEMIE } from "@/lib/network";
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

      {/* Violet field hero */}
      <section className="relative isolate overflow-hidden bg-[var(--accent)] text-[var(--on-accent)]">
        <AcademyArt className="pointer-events-none absolute -right-28 top-1/2 -z-10 hidden h-[34rem] w-auto -translate-y-1/2 md:block lg:right-0" />
        <div className="wrap pb-14 pt-8 md:pb-24 md:pt-10">
          <Breadcrumb
            onDark
            items={[{ label: "Accueil", href: "/" }, { label: "Formations" }]}
          />
          <h1 className="t-display mt-10 max-w-[14ch] text-white md:mt-16">
            Nos formations : la ligne Académie
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/90 sm:text-xl">
            Programmes professionnels en intelligence artificielle,
            automatisation, développement, gestion de projet et bases de
            données — disponibles en présentiel, distanciel ou
            intra-entreprise.
          </p>
        </div>
      </section>

      <section aria-label="Liste des formations" className="py-14 md:py-20">
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
          <Terminus
            titleId="formations-terminus"
            title="Inscrivez vos équipes à la bonne station."
            colors={[ACADEMIE.color, "#b7a0f5"]}
            actions={
              <CTAButton
                intent="training"
                label="Demander un devis / S'inscrire"
                block="training-section"
                size="lg"
                onDark
              />
            }
          >
            Programme et tarifs sur demande : dites-nous votre besoin et la
            modalité qui vous convient.
          </Terminus>
        </div>
      </div>
    </div>
  );
}
