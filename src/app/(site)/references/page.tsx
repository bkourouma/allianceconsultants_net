import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { PillLink } from "@/components/about/PillLink";
import {
  PROJECT_REFERENCES_PAGE_SIZE,
  listPublishedProjectReferences,
  listPublishedSectors,
} from "@/lib/projectReferences";
import { buildMetadata, buildReferencesBreadcrumbJsonLd } from "@/lib/seo";
import { ReferenceTicket } from "./ReferenceTicket";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Références clients — cas d'usage Alliance Consultants",
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

      <section className="bg-enamel pb-10 pt-10 lg:pb-14 lg:pt-16">
        <div className="wrap">
          <h1 className="t-display max-w-[22ch] text-ink">
            Des projets concrets, de la problématique à l&apos;impact
          </h1>
          <p className="t-lead mt-6">
            Une sélection de réalisations Alliance Consultants : transformation
            digitale, dématérialisation, automatisation IA, SaaS métier. Chaque
            fiche détaille la problématique, la solution mise en œuvre et
            l&apos;impact constaté.
          </p>

          {sectors.length > 0 ? (
            <nav
              aria-label="Filtrer par secteur"
              className="mt-10 border-y-2 border-ink py-4 lg:mt-12"
            >
              <p className="t-field mb-3">Filtrer par secteur</p>
              <ul className="flex flex-wrap items-center gap-2">
                <li>
                  <SectorChip href="/references" active={!sector}>
                    Tous
                  </SectorChip>
                </li>
                {sectors.map((s) => {
                  const active = sector?.toLowerCase() === s.toLowerCase();
                  return (
                    <li key={s}>
                      <SectorChip
                        href={`/references?secteur=${encodeURIComponent(s)}`}
                        active={active}
                      >
                        {s}
                      </SectorChip>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
        </div>
      </section>

      <section className="bg-enamel pb-20 pt-4 lg:pb-28">
        <div className="wrap">
          {items.length === 0 ? (
            <EmptyState sector={sector} />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
              {items.map((r) => (
                <ReferenceTicket key={r.id} reference={r} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <Pagination page={page} totalPages={totalPages} sector={sector} />
          ) : null}
        </div>
      </section>
    </>
  );
}

/** Neutral navy filter chip (sectors are free text, not product lines). */
function SectorChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 border-ink bg-ink px-4 font-display text-[1.0625rem] font-bold text-white"
          : "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 border-ink-mute/70 bg-panel px-4 font-display text-[1.0625rem] font-bold text-ink transition-colors duration-200 hover:border-ink hover:bg-enamel"
      }
    >
      {active ? (
        <Check aria-hidden className="size-4 shrink-0" strokeWidth={2.5} />
      ) : null}
      {children}
    </Link>
  );
}

/**
 * The blank coupon: empty ruled fields where the first published reference
 * will land, with the one useful action next to it.
 */
function EmptyState({ sector }: { sector?: string }) {
  return (
    <div className="coupon grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="p-6 sm:p-10 lg:p-12">
        <h2 className="t-h2 max-w-[20ch] text-ink">
          {sector
            ? `Aucune référence publiée pour le secteur « ${sector} » pour le moment.`
            : "Les références publiées arriveront ici"}
        </h2>
        <p className="t-body mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">
          {sector
            ? "Essayez un autre secteur ou consultez l'ensemble des références. En attendant, nos consultants peuvent vous présenter des cas d'usage proches de votre contexte."
            : "Chaque fiche présentera la problématique d'un projet, la solution mise en œuvre et l'impact constaté. En attendant, échangeons sur votre contexte : nos consultants peuvent vous présenter des cas d'usage proches du vôtre."}
        </p>
        {sector ? (
          <p className="mt-5">
            <Link
              href="/references"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline underline-offset-4 hover:decoration-2"
            >
              Voir toutes les références
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </p>
        ) : null}

        <dl aria-hidden className="mt-8 grid max-w-md gap-2.5">
          {["Organisation", "Projet", "Année"].map((label) => (
            <div key={label} className="grid grid-cols-[6rem_1fr] items-end gap-3">
              <dt className="t-field">{label}</dt>
              <dd className="h-5 border-b-2 border-dashed border-ink-mute/60" />
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col justify-center gap-3 border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 sm:p-8 lg:border-l-2 lg:border-t-0">
        <p className="t-field !text-carbon">Coupon détachable</p>
        <PillLink
          size="lg"
          className="w-full"
          href="/contact-demo?intent=contact&from=references&block=references-empty"
        >
          Discutons de votre projet
        </PillLink>
      </div>
    </div>
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
  const btn =
    "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 border-ink bg-panel px-5 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-white";
  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-5 text-sm"
    >
      <span className="t-num t-field !text-[0.8125rem]">
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} rel="prev" className={btn}>
            <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
            Précédentes
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={buildHref(page + 1)} rel="next" className={btn}>
            Suivantes
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
