import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SolutionCard } from "@/components/shared/SolutionCard";
import { JsonLd } from "@/components/shared/JsonLd";
import { getSolutions } from "@/lib/content";
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

      <Section bg="white" className="!pb-8">
        <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[var(--color-primary)]">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-gray-700">Solutions</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Nos solutions SaaS
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-gray-600">
          Une famille de plateformes métier pensées pour les organisations
          africaines : gestion documentaire, santé, immobilier, diffusion
          d&apos;annonces et formation digitale.
        </p>
      </Section>

      <Section bg="gray" className="!pt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <SolutionCard key={solution.slug} solution={solution} />
          ))}
        </div>
      </Section>
    </>
  );
}
