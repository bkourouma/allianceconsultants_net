import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/shared/JsonLd";
import { ProjectReferenceCard } from "@/components/references/ProjectReferenceCard";
import {
  PROJECT_REFERENCES_PAGE_SIZE,
  listPublishedProjectReferences,
  listPublishedSectors,
} from "@/lib/projectReferences";
import { buildMetadata, buildReferencesBreadcrumbJsonLd } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Références clients — projets et cas d'usage Alliance Consultants",
      description:
        "Découvrez les références d'Alliance Consultants : projets de transformation digitale, dématérialisation, IA et SaaS métier menés pour des organisations africaines.",
      siteUrl: `${SITE_URL}/references`,
    }),
    alternates: { canonical: `${SITE_URL}/references` },
  };
}

interface PageProps {
  searchParams: Promise<{ page?: string; secteur?: string }>;
}

export default async function ReferencesIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const sector = params.secteur?.trim() || undefined;

  const [{ items, total }, sectors] = await Promise.all([
    listPublishedProjectReferences({ page, sector }),
    listPublishedSectors(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PROJECT_REFERENCES_PAGE_SIZE));
  const breadcrumbJsonLd = buildReferencesBreadcrumbJsonLd({ siteUrl: SITE_URL });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 100% 0%, rgba(59,130,246,0.18), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Références &amp; cas clients
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            Des projets concrets, des résultats mesurables
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Une sélection de réalisations Alliance Consultants : transformation
            digitale, dématérialisation, automatisation IA, SaaS métier. Chaque
            fiche détaille la problématique, la solution mise en œuvre et
            l&apos;impact constaté.
          </p>

          {sectors.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Filtrer par secteur :
              </span>
              <Link
                href="/references"
                className={
                  !sector
                    ? "inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                    : "inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-primary"
                }
              >
                Tous
              </Link>
              {sectors.map((s) => {
                const active =
                  sector?.toLowerCase() === s.toLowerCase();
                return (
                  <Link
                    key={s}
                    href={`/references?secteur=${encodeURIComponent(s)}`}
                    className={
                      active
                        ? "inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                        : "inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-primary"
                    }
                  >
                    {s}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-600">
              {sector
                ? `Aucune référence publiée pour le secteur « ${sector} » pour le moment.`
                : "Aucune référence publiée pour le moment."}
            </p>
            <Link
              href="/contact-demo?intent=contact&fromPage=%2Freferences&fromBlock=references-empty"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              Discutons de votre projet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <ProjectReferenceCard key={r.id} reference={r} />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <Pagination page={page} totalPages={totalPages} sector={sector} />
        ) : null}
      </section>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  sector,
}: {
  page: number;
  totalPages: number;
  sector?: string;
}) {
  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (sector) sp.set("secteur", sector);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/references${qs ? `?${qs}` : ""}`;
  }
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between text-sm"
    >
      <span className="text-slate-500">
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            rel="prev"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            ← Précédentes
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            rel="next"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Suivantes →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
