import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Accordion, type AccordionItem } from "@/components/services/Accordion";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { Checklist } from "@/components/services/Checklist";
import { CouponHead } from "@/components/services/CouponHead";
import { ProductChips } from "@/components/services/ProductChips";
import { RichBody } from "@/components/services/RichBody";
import { StubCTA } from "@/components/services/StubCTA";
import {
  SERVICE_META,
  linesForService,
  serviceCta,
} from "@/components/services/serviceMap";
import { extractTopics, isSafeClaim } from "@/components/services/text";
import {
  getAllServiceSlugs,
  getServiceBySlug,
  getServices,
} from "@/lib/content";
import { buildFaqJsonLd, buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) {
    return {
      title: "Service introuvable",
      robots: { index: false, follow: false },
    };
  }
  const url = `${SITE_URL}/services/${slug}`;
  return {
    ...buildMetadata({
      title: service.seoTitle ?? `${service.title} — Alliance Consultants`,
      description: service.seoDescription ?? service.shortDescription,
      siteUrl: url,
    }),
    alternates: { canonical: url },
  };
}

export default async function ServiceDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const allServices = await getServices();
  const position = Math.max(
    0,
    allServices.findIndex((s) => s.slug === service.slug),
  );
  const numeral = String(position + 1).padStart(2, "0");

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
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${SITE_URL}/services/${service.slug}`,
      },
    ],
  };

  const meta = SERVICE_META[service.slug];
  const lineIds = linesForService(service.slug);
  const steps =
    meta?.journey && meta.journey.length > 1
      ? meta.journey
      : extractTopics(service.shortDescription);
  const cta = serviceCta(service.slug);
  const isAutomation = cta.intent === "automation";
  const showBenefit = isSafeClaim(service.benefit);
  const faqJsonLd = service.faq ? buildFaqJsonLd(service.faq) : null;
  const faqItems: AccordionItem[] = (service.faq ?? []).map((entry, i) => ({
    id: `faq-${i}`,
    title: entry.question,
    content: <p className="t-body">{entry.answer}</p>,
  }));

  const accordion: AccordionItem[] = [];
  if (showBenefit) {
    accordion.push({
      id: "benefice",
      title: "Ce que vous y gagnez",
      defaultOpen: true,
      content: <p className="t-body">{service.benefit}</p>,
    });
  }
  accordion.push({
    id: "demarrer",
    title: "Comment démarrer",
    defaultOpen: !showBenefit,
    content: (
      <p className="t-body">
        Faites-nous part de votre besoin : nous échangeons avec vous pour
        cadrer le périmètre avant toute proposition.
      </p>
    ),
  });

  return (
    <>
      <JsonLd data={breadcrumb} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* Hero: the work-order coupon */}
      <section className="pb-12 pt-4 md:pb-16">
        <div className="wrap">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
          />
          <div className="coupon mt-5 grid md:mt-7 md:grid-cols-[minmax(0,1fr)_17rem]">
            <CouponHead
              no={String(position + 1)}
              label="Bon de travail"
              right="Alliance Consultants"
              className="md:col-span-2"
            />
            <div className="min-w-0 px-5 py-8 md:px-10 md:py-12">
              <h1 className="t-h2 max-w-[22ch] text-ink">
                {service.h1 ?? service.title}
              </h1>
              <p className="t-lead mt-6">{service.shortDescription}</p>
            </div>
            <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-6 md:border-l-2 md:border-t-0 md:px-6 md:py-8">
              <div>
                <p className="t-field text-carbon!">Coupon détachable</p>
                <p
                  aria-hidden
                  className="carbon mt-1 font-display text-[4rem] font-extrabold leading-[0.9] md:text-[5rem]"
                >
                  {numeral}
                </p>
              </div>
              <CTAButton
                intent={cta.intent}
                label={cta.label}
                block="service-card"
                size="md"
                className="h-auto min-h-12 w-full px-4 py-2 text-center leading-tight"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 md:pb-24">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="min-w-0">
            {steps.length > 1 && (
              <section
                id="etapes"
                aria-labelledby="etapes-title"
                className="mb-14 scroll-mt-28"
              >
                <h2 id="etapes-title" className="t-h3 mb-5 text-ink">
                  Les étapes de ce service
                </h2>
                <Checklist
                  items={steps}
                  caption="Fiche d'étapes"
                  label="Les étapes de ce service"
                />
              </section>
            )}

            <RichBody body={service.body} />

            {faqItems.length > 0 && (
              <section id="questions-frequentes" className="mt-14 scroll-mt-28">
                <h2 className="t-h3 mb-5 text-ink">Questions fréquentes</h2>
                <Accordion items={faqItems} />
              </section>
            )}

            <h2 className="t-h3 mb-5 mt-14 text-ink">Le détail</h2>
            <Accordion items={accordion} />
          </div>

          {lineIds.length > 0 && (
            <aside
              aria-labelledby="related-title"
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <div className="coupon">
                <div className="px-6 pb-6 pt-7 md:px-8 md:pt-8">
                  <h2 id="related-title" className="t-h3 text-ink">
                    Produits associés
                  </h2>
                  <p className="mt-2 text-ink-soft">
                    {meta?.transversal
                      ? "Ce service s'applique à toutes nos solutions."
                      : "Les solutions de la plateforme sur lesquelles ce service s'appuie."}
                  </p>
                  <ProductChips ids={lineIds} link className="mt-5" />
                </div>
                <div className="border-t-2 border-dashed border-ink bg-[#f6f5fb] px-6 py-3 md:px-8">
                  <Link
                    href="/solutions"
                    className="group/all inline-flex min-h-11 items-center gap-2 font-display text-base font-bold uppercase tracking-[0.06em] text-ink underline-offset-4 hover:underline"
                  >
                    Voir toutes les solutions
                    <ArrowRight
                      aria-hidden
                      strokeWidth={2.25}
                      className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/all:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </Link>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* Closing stub */}
      <div className="pb-16 md:pb-24">
        <div className="wrap">
          <StubCTA
            titleId="service-cta-title"
            title={
              isAutomation
                ? "Automatisons un premier processus."
                : "Parlons de votre projet."
            }
            actions={
              <>
                <CTAButton
                  intent={cta.intent}
                  label={cta.label}
                  block="final-cta"
                  size="md"
                  className="h-auto min-h-12 w-full px-4 py-2 text-center leading-tight"
                />
                <Link
                  href="/services"
                  className="inline-flex min-h-11 items-center font-display text-base font-bold uppercase tracking-[0.06em] text-ink underline underline-offset-4 hover:text-ink-soft"
                >
                  Voir tous les services
                </Link>
              </>
            }
          >
            {isAutomation ? (
              <>
                Notre{" "}
                <strong className="font-semibold text-ink">
                  conseil en automatisation des process
                </strong>{" "}
                commence par un audit de 5 jours : cartographie, ROI attendu et
                feuille de route sur 12 mois.
              </>
            ) : (
              "Décrivez-nous votre contexte : nous revenons vers vous pour cadrer le besoin."
            )}
          </StubCTA>
        </div>
      </div>
    </>
  );
}
