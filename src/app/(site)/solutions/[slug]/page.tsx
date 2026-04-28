import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { SolutionHero } from "@/components/solutions/SolutionHero";
import { ValueProp } from "@/components/solutions/ValueProp";
import { TargetAudience } from "@/components/solutions/TargetAudience";
import { FeatureGrid } from "@/components/solutions/FeatureGrid";
import { BenefitList } from "@/components/solutions/BenefitList";
import { UseCases } from "@/components/solutions/UseCases";
import { ProofBlock } from "@/components/solutions/ProofBlock";
import { Faq } from "@/components/solutions/Faq";
import { RelatedSolutions } from "@/components/solutions/RelatedSolutions";
import { LeadFormSection } from "@/components/solutions/LeadFormSection";
import {
  getAllSolutionDetailSlugs,
  getSolutionDetailBySlug,
  getSolutions,
} from "@/lib/content";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildMetadata,
  buildProductJsonLd,
} from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllSolutionDetailSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolutionDetailBySlug(slug);
  if (!solution) {
    return {
      title: "Solution introuvable",
      robots: { index: false, follow: false },
    };
  }
  const url = `${SITE_URL}/solutions/${slug}`;
  return {
    ...buildMetadata({
      title: solution.seoTitle,
      description: solution.seoDescription,
      ogImage: solution.ogImage,
      siteUrl: url,
    }),
    alternates: { canonical: url },
  };
}

export default async function SolutionDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const solution = await getSolutionDetailBySlug(slug);
  if (!solution) {
    notFound();
  }

  const allSolutions = await getSolutions();

  const productJsonLd = buildProductJsonLd(solution, SITE_URL);
  const faqJsonLd = buildFaqJsonLd(solution.faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    slug: solution.slug,
    name: solution.name,
    siteUrl: SITE_URL,
  });

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                >
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li>
                <Link
                  href="/solutions"
                  className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
                >
                  Solutions
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li className="font-medium text-slate-700">{solution.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <section id="hero">
        <SolutionHero hero={solution.hero} category={solution.category} />
      </section>

      <section id="proposition-de-valeur" aria-labelledby="proposition-title">
        <h2 id="proposition-title" className="sr-only">
          Proposition de valeur
        </h2>
        <ValueProp text={solution.valueProposition} />
      </section>

      <section id="cibles" aria-labelledby="cibles-title">
        <h2 id="cibles-title" className="sr-only">
          Cibles et problèmes adressés
        </h2>
        <TargetAudience
          items={solution.targetAudience}
          problemsSolved={solution.problemsSolved}
        />
      </section>

      <section id="fonctionnalites" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">
          Fonctionnalités
        </h2>
        <FeatureGrid groups={solution.featureGroups} />
      </section>

      <section id="benefices" aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="sr-only">
          Bénéfices
        </h2>
        <BenefitList benefits={solution.benefits} />
      </section>

      {solution.useCases && solution.useCases.length > 0 && (
        <section id="cas-usage" aria-labelledby="usecases-title">
          <h2 id="usecases-title" className="sr-only">
            Cas d&apos;usage
          </h2>
          <UseCases useCases={solution.useCases} />
        </section>
      )}

      <section id="preuves" aria-labelledby="proof-title">
        <h2 id="proof-title" className="sr-only">
          Preuves
        </h2>
        <ProofBlock proof={solution.proof} useCasesFallback={solution.useCases} />
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="sr-only">
          Questions fréquentes
        </h2>
        <Faq entries={solution.faq} />
      </section>

      <section id="solutions-associees" aria-labelledby="related-title">
        <h2 id="related-title" className="sr-only">
          Solutions associées
        </h2>
        <RelatedSolutions
          related={solution.relatedSolutions}
          allSolutions={allSolutions}
        />
      </section>

      <LeadFormSection
        solutionSlug={solution.slug}
        solutionName={solution.name}
        intent={solution.hero.primaryCta.intent}
        ctaLabel={
          solution.hero.primaryCta.intent === "training"
            ? "Demander un programme"
            : "Envoyer ma demande"
        }
      />
    </>
  );
}
