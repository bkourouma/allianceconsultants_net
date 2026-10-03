import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb } from "@/components/services/Breadcrumb";
import { RichBody } from "@/components/services/RichBody";
import { Terminus } from "@/components/services/Terminus";
import { extractTopics } from "@/components/services/text";
import { AcademyArt } from "@/components/formations/AcademyArt";
import { ModalityPicker } from "@/components/formations/ModalityPicker";
import { TopicLine } from "@/components/formations/TopicLine";
import {
  MODALITY_LABELS,
  activeModalities,
} from "@/components/formations/modalities";
import { getAllTrainingSlugs, getTrainingBySlug } from "@/lib/content";
import { ACADEMIE } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";

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
      title: `${training.title} — Alliance Consultants`,
      description: training.shortDescription,
      siteUrl: url,
    }),
    alternates: { canonical: url },
  };
}

export default async function FormationDetailPage({ params }: RouteProps) {
  const { slug } = await params;
  const training = await getTrainingBySlug(slug);
  if (!training) notFound();

  // The MDX body often opens with a heading repeating the page H1: drop it.
  function stripTitleHeading(body: string, title: string): string {
    const lines = body.replace(/^\s+/, "").split("\n");
    const head = lines[0] ?? "";
    if (/^#{1,3}\s/.test(head) && head.replace(/^#{1,3}\s+/, "").trim() === title.trim()) {
      return lines.slice(1).join("\n").replace(/^\s+/, "");
    }
    return body;
  }

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

      {/* Violet field hero */}
      <section className="relative isolate overflow-hidden bg-[var(--accent)] text-[var(--on-accent)]">
        <AcademyArt className="pointer-events-none absolute -right-32 top-1/2 -z-10 hidden h-[30rem] w-auto -translate-y-1/2 opacity-80 md:block lg:right-0" />
        <div className="wrap pb-14 pt-8 md:pb-20 md:pt-10">
          <Breadcrumb
            onDark
            items={[
              { label: "Accueil", href: "/" },
              { label: "Formations", href: "/formations" },
              { label: training.title },
            ]}
          />
          <h1 className="t-h2 mt-10 max-w-[20ch] text-white md:mt-14">
            {training.title}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-white/90 sm:text-xl">
            {training.shortDescription}
          </p>
          <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Modalités">
            {modalities.map((k) => (
              <li
                key={k}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-ink"
              >
                {MODALITY_LABELS[k]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="min-w-0">
            <RichBody body={stripTitleHeading(training.body, training.title)} />

            {topics.length > 1 && (
              <>
                <h2 className="t-h3 mb-6 mt-14 text-ink">Thèmes abordés</h2>
                <TopicLine topics={topics} />
              </>
            )}
          </div>

          <aside
            aria-labelledby="about-title"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-lg bg-panel p-6 ring-1 ring-rule md:p-8">
              <h2 id="about-title" className="t-h3 text-ink">
                En un coup d&apos;œil
              </h2>
              <dl className="mt-5 divide-y divide-rule">
                <div className="py-4 first:pt-0">
                  <dt className="text-sm font-semibold text-ink-mute">
                    Domaine
                  </dt>
                  <dd className="mt-1 font-display text-lg font-bold text-ink">
                    {training.category}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm font-semibold text-ink-mute">
                    Modalités
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {modalities.map((k) => (
                      <span
                        key={k}
                        className="rounded-full bg-enamel px-3 py-1 text-sm font-semibold text-ink ring-1 ring-inset ring-rule"
                      >
                        {MODALITY_LABELS[k]}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="py-4 last:pb-0">
                  <dt className="text-sm font-semibold text-ink-mute">
                    Programme et tarifs
                  </dt>
                  <dd className="mt-1 text-ink">
                    Sur demande.{" "}
                    <a
                      href="#devis"
                      className="font-semibold text-[var(--accent)] underline underline-offset-4"
                    >
                      Demander un devis
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* Terminus */}
      <div id="devis" className="scroll-mt-24 pb-16 md:pb-24">
        <div className="wrap">
          <Terminus
            titleId="formation-terminus"
            title="Demandez votre devis, nous préparons le reste."
            colors={[ACADEMIE.color, "#b7a0f5"]}
            actions={
              <div className="flex w-full flex-col gap-6">
                <ModalityPicker available={modalities} />
                <Link
                  href="/formations"
                  className="inline-flex min-h-11 items-center self-start rounded-full px-1 font-semibold text-white underline underline-offset-4 hover:text-white/80"
                >
                  Voir toutes les formations
                </Link>
              </div>
            }
          >
            Programme et tarifs sur demande : indiquez-nous vos besoins et la
            modalité qui vous convient.
          </Terminus>
        </div>
      </div>
    </div>
  );
}
