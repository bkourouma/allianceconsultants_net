import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { Checklist } from "@/components/services/Checklist";
import { RichBody } from "@/components/services/RichBody";
import { StubCTA } from "@/components/services/StubCTA";
import { extractTopics } from "@/components/services/text";
import { ModalityPicker } from "@/components/formations/ModalityPicker";
import { PassBarcode } from "@/components/formations/PassBarcode";
import {
  MODALITY_LABELS,
  activeModalities,
} from "@/components/formations/modalities";
import { getAllTrainingSlugs, getTrainingBySlug } from "@/lib/content";
import { buildMetadata, withBrandSuffix } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllTrainingSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const training = await getTrainingBySlug(slug);
  if (!training) {
    return {
      title: "Formation introuvable",
      robots: { index: false, follow: false },
    };
  }
  const url = `${SITE_URL}/formations/${slug}`;
  return {
    ...buildMetadata({
      title: withBrandSuffix(training.title),
      description: training.shortDescription,
      siteUrl: url,
    }),
    alternates: { canonical: url },
  };
}

// The MDX body often opens with a heading repeating the page H1: drop it.
function stripTitleHeading(body: string, title: string): string {
  const lines = body.replace(/^\s+/, "").split("\n");
  const head = lines[0] ?? "";
  if (
    /^#{1,3}\s/.test(head) &&
    head.replace(/^#{1,3}\s+/, "").trim() === title.trim()
  ) {
    return lines.slice(1).join("\n").replace(/^\s+/, "");
  }
  return body;
}

export default async function FormationDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const training = await getTrainingBySlug(slug);
  if (!training) notFound();

  const modalities = activeModalities(training.modalities);
  const topics = extractTopics(training.shortDescription);

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
      {
        "@type": "ListItem",
        position: 3,
        name: training.title,
        item: `${SITE_URL}/formations/${training.slug}`,
      },
    ],
  };

  return (
    <div className="line-academie">
      <JsonLd data={breadcrumb} />

      {/* Hero: the access pass */}
      <section className="pb-12 pt-4 md:pb-16">
        <div className="wrap">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Formations", href: "/formations" },
              { label: training.title },
            ]}
          />
          <div className="coupon mt-5 grid overflow-hidden md:mt-7 md:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="relative h-[4.25rem] bg-[var(--accent)] text-[var(--on-accent)] md:col-span-2">
              <span
                aria-hidden
                className="absolute left-1/2 top-3 h-3 w-16 -translate-x-1/2 rounded-full border-2 border-ink bg-enamel"
              />
              <span className="absolute bottom-2.5 left-5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
                Pass Académie
              </span>
              <PassBarcode
                seed={training.slug}
                className="absolute bottom-2.5 right-5 h-5 w-24 text-white"
              />
            </div>
            <div className="min-w-0 px-5 py-8 md:px-10 md:py-12">
              <p className="t-field text-carbon!">{training.category}</p>
              <h1 className="t-h2 mt-3 max-w-[20ch] text-ink">
                {training.title}
              </h1>
              <p className="t-lead mt-6">{training.shortDescription}</p>
            </div>
            <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-6 md:border-l-2 md:border-t-0 md:px-6 md:py-8">
              <div>
                <p className="t-field text-carbon!">Accès</p>
                <ul aria-label="Modalités" className="mt-3 flex flex-wrap gap-2">
                  {modalities.map((k) => (
                    <li
                      key={k}
                      className="inline-flex min-h-8 items-center rounded-[3px] border-2 border-ink bg-white px-2.5 font-display text-[0.9375rem] font-bold uppercase leading-none tracking-[0.05em] text-ink"
                    >
                      {MODALITY_LABELS[k]}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="t-field leading-snug">
                Programme et tarifs sur demande
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 md:pb-24">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="min-w-0">
            <RichBody body={stripTitleHeading(training.body, training.title)} />

            {topics.length > 1 && (
              <section
                aria-labelledby="themes-title"
                className="mt-14"
              >
                <h2 id="themes-title" className="t-h3 mb-5 text-ink">
                  Thèmes abordés
                </h2>
                <Checklist
                  items={topics}
                  caption="Fiche de thèmes"
                  label="Thèmes abordés"
                />
              </section>
            )}
          </div>

          <aside
            aria-labelledby="about-title"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="coupon">
              <div className="px-6 pb-6 pt-7 md:px-8 md:pt-8">
                <h2 id="about-title" className="t-h3 text-ink">
                  Programme et tarifs
                </h2>
                <p className="mt-2 text-ink-soft">
                  Programme et tarifs sur demande : nous les adaptons à votre
                  besoin et à la modalité choisie.
                </p>
              </div>
              <div className="border-t-2 border-dashed border-ink bg-[#f6f5fb] px-6 py-3 md:px-8">
                <a
                  href="#devis"
                  className="group/devis inline-flex min-h-11 items-center gap-2 font-display text-base font-bold uppercase tracking-[0.06em] text-ink underline-offset-4 hover:underline"
                >
                  Demander un devis
                  <ArrowRight
                    aria-hidden
                    strokeWidth={2.25}
                    className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/devis:translate-x-0.5 motion-reduce:transition-none"
                  />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Closing stub */}
      <div id="devis" className="scroll-mt-24 pb-16 md:pb-24">
        <div className="wrap">
          <StubCTA
            titleId="formation-cta-title"
            title="Demandez votre devis, nous préparons le reste."
            caption="Pass à détacher"
            actions={
              <div className="flex w-full flex-col gap-4">
                <ModalityPicker available={modalities} />
                <Link
                  href="/formations"
                  className="inline-flex min-h-11 items-center self-start font-display text-base font-bold uppercase tracking-[0.06em] text-ink underline underline-offset-4 hover:text-ink-soft"
                >
                  Voir toutes les formations
                </Link>
              </div>
            }
          >
            Programme et tarifs sur demande : indiquez-nous vos besoins et la
            modalité qui vous convient.
          </StubCTA>
        </div>
      </div>
    </div>
  );
}
