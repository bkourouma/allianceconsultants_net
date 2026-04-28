import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/shared/JsonLd";
import { getAllTrainingSlugs, getTrainingBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

const MODALITY_LABELS = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  intra: "Intra-entreprise",
} as const;

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

  const activeModalities = (
    Object.entries(training.modalities) as [
      keyof typeof MODALITY_LABELS,
      boolean,
    ][]
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => MODALITY_LABELS[key]);

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
    <>
      <JsonLd data={breadcrumb} />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li>
                <Link href="/" className="hover:text-primary">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li>
                <Link href="/formations" className="hover:text-primary">
                  Formations
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">
                /
              </li>
              <li className="font-medium text-slate-700">{training.title}</li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {training.category}
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            {training.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {training.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {activeModalities.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-primary/[0.08] px-3 py-1 text-xs font-semibold text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Section bg="white" padding="md">
        <article className="mx-auto max-w-3xl whitespace-pre-line text-base leading-relaxed text-slate-700">
          {training.body.trim()}
        </article>

        <div className="mx-auto mt-12 max-w-3xl border-t border-slate-200 pt-8">
          <Link
            href="/contact-demo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Demander un devis formation →
          </Link>
        </div>
      </Section>
    </>
  );
}
