import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { ServiceFinder } from "@/components/services/ServiceFinder";
import { StubCTA } from "@/components/services/StubCTA";
import { getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Nos services — Alliance Consultants",
      description:
        "Développement spécifique, automatisation IA, AMOA, numérisation et dématérialisation des archives : nos services pour les organisations africaines.",
      siteUrl: `${SITE_URL}/services`,
    }),
    alternates: { canonical: `${SITE_URL}/services` },
  };
}

export default async function ServicesIndexPage() {
  const services = await getServices();

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
        name: "Services",
        item: `${SITE_URL}/services`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <section className="pb-10 pt-4 md:pb-14">
        <div className="wrap">
          <Breadcrumb
            items={[{ label: "Accueil", href: "/" }, { label: "Services" }]}
          />
          <h1 className="t-display mt-6 max-w-[24ch] text-ink md:mt-10">
            Concevoir, automatiser, dématérialiser
          </h1>
          <p className="t-lead mt-6">
            Du développement spécifique à la dématérialisation, en passant par
            l&apos;automatisation IA et l&apos;AMOA : nous accompagnons les
            organisations africaines à chaque étape de leur transformation
            digitale.
          </p>
        </div>
      </section>

      <section aria-label="Liste des services" className="pb-16 md:pb-24">
        <div className="wrap">
          {services.length === 0 ? (
            <p className="text-ink-soft">
              Aucun service disponible pour le moment.
            </p>
          ) : (
            <ServiceFinder
              services={services.map((s) => ({
                slug: s.slug,
                title: s.title,
                shortDescription: s.shortDescription,
              }))}
            />
          )}
        </div>
      </section>

      <div className="pb-16 md:pb-24">
        <div className="wrap">
          <StubCTA
            titleId="services-cta-title"
            title="Un besoin ? Décrivez-le-nous."
            actions={
              <>
                <CTAButton
                  intent="contact"
                  label="Demander un échange"
                  block="final-cta"
                  size="lg"
                  className="w-full"
                />
                <CTAButton
                  intent="automation"
                  label="Automatiser un processus"
                  block="final-cta"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                />
              </>
            }
          >
            Décrivez votre contexte : nous vous indiquons le service et la
            solution qui correspondent.
          </StubCTA>
        </div>
      </div>
    </>
  );
}
