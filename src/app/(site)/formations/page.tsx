import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { TrainingCard } from "@/components/shared/TrainingCard";
import { JsonLd } from "@/components/shared/JsonLd";
import { getTrainings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Nos formations — Alliance Consultants",
      description:
        "Formations professionnelles en IA, automatisation, développement, gestion de projet et SQL Server, en présentiel, distanciel ou intra-entreprise.",
      siteUrl: `${SITE_URL}/formations`,
    }),
    alternates: { canonical: `${SITE_URL}/formations` },
  };
}

export default async function FormationsIndexPage() {
  const trainings = await getTrainings();

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
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 100% 0%, rgba(59,130,246,0.18), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <nav aria-label="Fil d'Ariane" className="mb-8">
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
              <li className="font-medium text-slate-700">Formations</li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Montée en compétences
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Nos formations
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Programmes professionnels en intelligence artificielle,
            automatisation, développement, gestion de projet et bases de
            données — disponibles en présentiel, distanciel ou intra-entreprise.
          </p>
        </div>
      </section>

      <Section bg="gray" padding="md">
        {trainings.length === 0 ? (
          <p className="text-center text-slate-600">
            Aucune formation disponible pour le moment.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainings.map((training) => (
              <TrainingCard key={training.slug} training={training} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
