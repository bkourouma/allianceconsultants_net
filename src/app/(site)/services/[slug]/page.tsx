import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Accordion, type AccordionItem } from "@/components/services/Accordion";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { HeroStrokes } from "@/components/services/HeroStrokes";
import { LineRoundel } from "@/components/services/LineRoundel";
import { ProcessLine } from "@/components/services/ProcessLine";
import { RichBody } from "@/components/services/RichBody";
import { Terminus } from "@/components/services/Terminus";
import {
  SERVICE_META,
  linesForService,
  serviceCta,
} from "@/components/services/serviceMap";
import { extractTopics, isSafeClaim } from "@/components/services/text";
import { getAllServiceSlugs, getServiceBySlug } from "@/lib/content";
import { getLine } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";

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
  };
}

export default async function ServiceDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

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
  const lines = lineIds.flatMap((id) => {
    const l = getLine(id);
    return l ? [l] : [];
  });
  const colors = lines.map((l) => l.color);
  const steps =
    meta?.journey && meta.journey.length > 1
      ? meta.journey
      : extractTopics(service.shortDescription);
  const cta = serviceCta(service.slug);
  const showBenefit = isSafeClaim(service.benefit);

  const accordion: AccordionItem[] = [];
  if (steps.length > 1) {
    accordion.push({
      id: "etapes",
      title: "Ce que couvre ce service",
      defaultOpen: true,
      content: (
        <ul className="t-body list-disc space-y-1.5 pl-5 marker:text-ink">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    });
  }
  if (showBenefit) {
    accordion.push({
      id: "benefice",
      title: "Ce que vous y gagnez",
      content: <p className="t-body">{service.benefit}</p>,
    });
  }
  accordion.push({
    id: "demarrer",
    title: "Comment démarrer",
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

      {/* Hero — night field with the service's own line diagram */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <HeroStrokes
          colors={colors}
          className="pointer-events-none absolute -right-24 -top-4 -z-10 hidden h-auto w-[34rem] opacity-60 md:block lg:right-0 lg:opacity-90"
        />
        <div className="wrap pb-14 pt-8 md:pb-20 md:pt-10">
          <Breadcrumb
            onDark
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
          />
          <h1 className="t-h2 mt-10 max-w-[20ch] text-white md:mt-14">
            {service.title}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-white/85 sm:text-xl">
            {service.shortDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton
              intent={cta.intent}
              label={cta.label}
              block="service-card"
              size="lg"
              onDark
            />
          </div>

          {steps.length > 1 && (
            <div className="mt-14 md:mt-20">
              <h2 className="sr-only">Les étapes de ce service</h2>
              <ProcessLine steps={steps} colors={colors} />
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="min-w-0">
            <RichBody body={service.body} />

            {showBenefit && (
              <p className="t-h3 mt-10 max-w-[32ch] border-t-2 border-ink pt-6 text-ink">
                {service.benefit}
              </p>
            )}

            <h2 className="t-h3 mb-5 mt-14 text-ink">Le détail</h2>
            <Accordion items={accordion} />
          </div>

          {lines.length > 0 && (
            <aside aria-labelledby="related-title" className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg bg-panel p-6 ring-1 ring-rule md:p-8">
                <h2 id="related-title" className="t-h3 text-ink">
                  Se connecte à
                </h2>
                <p className="mt-2 text-ink-soft">
                  {meta?.transversal
                    ? "Ce service s'applique à toutes nos solutions."
                    : "Les solutions de la plateforme sur lesquelles ce service s'appuie."}
                </p>
                <ul className="mt-5 divide-y divide-rule">
                  {lines.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/solutions/${l.slug}`}
                        className="group/rel flex items-center gap-4 py-4"
                      >
                        <LineRoundel line={l.id} href={false} size="md" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg font-bold tracking-tight text-ink">
                            {l.name}
                          </span>
                          <span className="block text-sm leading-snug text-ink-soft">
                            {l.pitch}
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden
                          strokeWidth={1.75}
                          className="size-5 shrink-0 text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/rel:translate-x-1 motion-reduce:transition-none"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* Terminus */}
      <div className="pb-16 md:pb-24">
        <div className="wrap">
          <Terminus
            titleId="service-terminus"
            title={
              cta.intent === "automation"
                ? "Automatisons un premier processus."
                : "Parlons de votre projet."
            }
            colors={colors}
            actions={
              <>
                <CTAButton
                  intent={cta.intent}
                  label={cta.label}
                  block="final-cta"
                  size="lg"
                  onDark
                />
                <Link
                  href="/services"
                  className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold text-white underline underline-offset-4 hover:text-white/80"
                >
                  Voir tous les services
                </Link>
              </>
            }
          >
            Décrivez-nous votre contexte : nous revenons vers vous pour cadrer
            le besoin.
          </Terminus>
        </div>
      </div>
    </>
  );
}
