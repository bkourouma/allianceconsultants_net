import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { ServiceFinder } from "@/components/services/ServiceFinder";
import { ServicesHeroArt } from "@/components/services/ServicesHeroArt";
import { Terminus } from "@/components/services/Terminus";
import { getServices } from "@/lib/content";
import { LINES } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Nos services — Alliance Consultants",
      description:
        "Développement spécifique, automatisation IA, AMOA, dématérialisation et scanners professionnels : nos services pour les organisations africaines.",
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

      <section className="relative isolate overflow-hidden">
        <ServicesHeroArt className="pointer-events-none absolute -right-10 top-0 -z-10 hidden h-full w-auto max-w-[44%] md:block lg:right-4" />
        <div className="wrap pb-12 pt-8 md:pb-20 md:pt-10">
          <Breadcrumb
            items={[{ label: "Accueil", href: "/" }, { label: "Services" }]}
          />
          <h1 className="t-display mt-10 max-w-[16ch] text-ink md:mt-16">
            Nos services, vos correspondances
          </h1>
          <p className="t-lead mt-6 md:max-w-[46ch]">
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
          <Terminus
            titleId="services-terminus"
            title="Un besoin ? Descendons à la bonne station."
            colors={LINES.map((l) => l.color)}
            actions={
              <>
                <CTAButton
                  intent="contact"
                  label="Demander un échange"
                  block="final-cta"
                  size="lg"
                  onDark
                />
                <CTAButton
                  intent="automation"
                  label="Automatiser un processus"
                  block="final-cta"
                  size="lg"
                  variant="secondary"
                  onDark
                />
              </>
            }
          >
            Décrivez votre contexte : nous vous indiquons le service et la
            solution qui correspondent.
          </Terminus>
        </div>
      </div>
    </>
  );
}
