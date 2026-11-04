import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { SolutionHero } from "@/components/solutions/SolutionHero";
import { ValueProp } from "@/components/solutions/ValueProp";
import { TargetAudience } from "@/components/solutions/TargetAudience";
import { FeatureGrid } from "@/components/solutions/FeatureGrid";
import { BenefitList } from "@/components/solutions/BenefitList";
import { ComparisonSection } from "@/components/solutions/ComparisonSection";
import { UseCases } from "@/components/solutions/UseCases";
import { ProofBlock, hasProof } from "@/components/solutions/ProofBlock";
import { SectionNav } from "@/components/solutions/SectionNav";
import { Breadcrumb } from "@/components/solutions/Breadcrumb";
import s from "@/components/solutions/Solutions.module.css";
import { getLine, lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
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


  const line = getLine(solution.slug);
  const scopeClass = line ? `line-${line.id}` : undefined;
  const proofFilled = hasProof(solution.proof);

  return (
    <div className={cn(scopeClass, s.focusInk)} style={lineStyle(solution.slug)}>
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <SolutionHero
        hero={solution.hero}
        category={solution.category}
        lineName={solution.name}
        slug={solution.slug}
        areas={solution.featureGroups.map((g) => g.title)}
        externalUrl={solution.externalUrl}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Solutions", href: "/solutions" },
              { label: solution.name },
            ]}
          />
        }
      />

      <SectionNav />

      <ValueProp
        text={solution.valueProposition}
        title={`Ce que ${solution.name} change pour vous`}
      />
      <TargetAudience
        items={solution.targetAudience}
        problemsSolved={solution.problemsSolved}
      />
      <FeatureGrid groups={solution.featureGroups} />
      <BenefitList benefits={solution.benefits} />
      {solution.comparison && (
        <ComparisonSection comparison={solution.comparison} />
      )}

      {proofFilled && solution.useCases && solution.useCases.length > 0 && (
        <UseCases useCases={solution.useCases} />
      )}
      <ProofBlock proof={solution.proof} useCasesFallback={solution.useCases} />

      <Faq entries={solution.faq} />
      <RelatedSolutions
        related={solution.relatedSolutions}
        allSolutions={allSolutions}
        currentSlug={solution.slug}
      />

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
    </div>
  );
}
