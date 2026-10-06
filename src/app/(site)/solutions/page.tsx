import type { Metadata } from "next";
import { CTAButton } from "@/components/shared/CTAButton";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb } from "@/components/solutions/Breadcrumb";
import {
  SolutionsFinder,
  type LineEntry,
} from "@/components/solutions/SolutionsFinder";
import { getSolutionDetailBySlug, getSolutions } from "@/lib/content";
import { LINES, getLine } from "@/lib/network";
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
      stations: detail?.featureGroups.map((g) => g.title) ?? [],
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

      <section className="relative isolate overflow-hidden bg-enamel text-ink">
        {/* The six lines leaving the page: decorative. */}
        <svg
          aria-hidden
          viewBox="0 0 520 260"
          preserveAspectRatio="xMaxYMid slice"
          className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden h-[58%] w-[44%] max-w-[640px] md:block min-[1400px]:top-0 min-[1400px]:h-full min-[1400px]:w-[48%]"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {LINES.map((l, i) => {
            const y = 150 + i * 22;
            return (
              <g key={l.id}>
                <path d={`M0 ${y} H170 L250 ${y - 80} H520`} stroke={l.color} />
                <circle
                  cx={360 + (i % 2) * 70}
                  cy={y - 80}
                  r="9"
                  fill="#fff"
                  stroke="#0b1b3a"
                  strokeWidth="4"
                />
              </g>
            );
          })}
        </svg>

        <div className="wrap pb-12 pt-6 lg:pb-16">
          <Breadcrumb
            items={[{ label: "Accueil", href: "/" }, { label: "Solutions" }]}
            className="text-ink-soft"
          />
          <h1 className="t-display mt-10 max-w-[18ch] text-ink lg:mt-14">
            Nos solutions, une ligne par métier
          </h1>
          <div className="mt-6 md:max-w-[52%]">
          <p className="t-lead">
            Une famille de plateformes métier pensées pour les organisations
            africaines : gestion documentaire, santé, immobilier, diffusion
            d&apos;annonces et formation digitale. Dites‑nous votre métier,
            nous vous indiquons la ligne.
          </p>
          </div>
        </div>
      </section>

      <SolutionsFinder lines={lines} />

      <section className="bg-enamel py-14 lg:py-20">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <h2 className="t-h3 max-w-[28ch] text-ink">
            Votre besoin ne tient pas dans une seule ligne&nbsp;?
          </h2>
          <CTAButton
            intent="contact"
            label="Parlez-nous de votre contexte"
            block="final-cta"
            from="solutions-index"
            size="lg"
          />
        </div>
      </section>
    </>
  );
}
