import type { Metadata } from "next";
import { CTAButton } from "@/components/shared/CTAButton";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb } from "@/components/solutions/Breadcrumb";
import {
  SolutionsFinder,
  type LineEntry,
} from "@/components/solutions/SolutionsFinder";
import { getSolutionDetailBySlug, getSolutions } from "@/lib/content";
import { getLine } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Nos solutions SaaS — Alliance Consultants",
      description:
        "Découvrez l'écosystème de solutions SaaS d'Alliance Consultants : GED, santé, immobilier, annonces et formation digitale en Afrique francophone.",
      siteUrl: `${SITE_URL}/solutions`,
    }),
    alternates: { canonical: `${SITE_URL}/solutions` },
  };
}

export default async function SolutionsIndexPage() {
  const solutions = await getSolutions();
  const details = await Promise.all(
    solutions.map((sol) => getSolutionDetailBySlug(sol.slug)),
  );

  const lines: LineEntry[] = solutions.map((sol, i) => {
    const detail = details[i];
    return {
      slug: sol.slug,
      name: sol.name,
      sector: getLine(sol.slug)?.sector ?? sol.category,
      category: sol.category,
      mainBenefit: sol.mainBenefit,
      shortDescription: sol.shortDescription,
      areas: detail?.featureGroups.map((g) => g.title) ?? [],
      audience: detail?.targetAudience.map((a) => a.label) ?? [],
      externalUrl: sol.externalUrl ?? null,
    };
  });

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
        name: "Solutions",
        item: `${SITE_URL}/solutions`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <section aria-labelledby="solutions-index-title" className="pb-12 pt-6 lg:pb-16">
        <div className="wrap">
          <Breadcrumb
            items={[{ label: "Accueil", href: "/" }, { label: "Solutions" }]}
            className="text-ink-soft"
          />
          <h1
            id="solutions-index-title"
            className="t-display mt-10 max-w-[20ch] text-ink lg:mt-14"
          >
            Nos solutions, un coupon par métier
          </h1>
          <p className="t-lead mt-6">
            Une famille de plateformes métier pensées pour les organisations
            africaines&nbsp;: gestion documentaire, santé, immobilier, diffusion
            d&apos;annonces et formation digitale. Dites‑nous votre métier,
            nous vous indiquons le coupon qui vous correspond.
          </p>
        </div>
      </section>

      <SolutionsFinder lines={lines} />

      <section aria-labelledby="solutions-contact-title" className="pb-20 lg:pb-28">
        <div className="wrap">
          <div className="coupon grid lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="p-6 sm:p-8 lg:p-10">
              <h2
                id="solutions-contact-title"
                className="t-h3 max-w-[30ch] text-ink"
              >
                Votre besoin ne tient pas dans un seul coupon&nbsp;?
              </h2>
              <p className="t-body mt-3 text-ink-soft">
                Décrivez-nous votre contexte : nous vous orientons vers la bonne
                solution, ou vers une combinaison.
              </p>
            </div>
            <div className="flex items-center border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 lg:rounded-br-[2px] lg:border-l-2 lg:border-t-0">
              <CTAButton
                intent="contact"
                label="Parlez-nous de votre contexte"
                block="final-cta"
                from="solutions-index"
                size="md"
                className="h-auto min-h-14 w-full py-2 text-center leading-tight"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
