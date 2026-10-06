import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { PillLink } from "@/components/about/PillLink";
import { RouteBand } from "@/components/about/RouteBand";
import {
  PROJECT_REFERENCES_PAGE_SIZE,
  listPublishedProjectReferences,
  listPublishedSectors,
} from "@/lib/projectReferences";
import { getLine } from "@/lib/network";
import { buildMetadata, buildReferencesBreadcrumbJsonLd } from "@/lib/seo";
import { ReferenceTicket, lineForSector } from "./ReferenceTicket";

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
  };
}

interface PageProps {
  searchParams: Promise<{ page?: string; secteur?: string }>;
}

const BAND = [
  getLine("medicpro")!.color,
  getLine("cliniquepro")!.color,
  getLine("docupro")!.color,
];

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

      <section className="bg-enamel pt-10 lg:pt-16">
        <div className="wrap">
          <h1 className="t-display max-w-[16ch] text-ink">
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
              className="mt-9"
            >
              <p className="t-station mb-3 text-ink-mute">
                Filtrer par secteur
              </p>
              <ul className="flex flex-wrap items-center gap-2">
                <li>
                  <SectorChip href="/references" active={!sector}>
                    Tous
                  </SectorChip>
                </li>
                {sectors.map((s) => {
                  const active = sector?.toLowerCase() === s.toLowerCase();
                  const line = lineForSector(s);
                  return (
                    <li key={s}>
                      <SectorChip
                        href={`/references?secteur=${encodeURIComponent(s)}`}
                        active={active}
                        color={line.color}
                        onColor={line.onColor}
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
        <RouteBand colors={BAND} className="mt-10 lg:mt-14" />
      </section>

      <section className="bg-enamel py-14 lg:py-20">
        <div className="wrap">
          {items.length === 0 ? (
            <EmptyState sector={sector} />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
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

function SectorChip({
  href,
  active,
  color,
  onColor,
  children,
}: {
  href: string;
  active: boolean;
  color?: string;
  onColor?: string;
  children: React.ReactNode;
}) {
  const fill = color ?? "#0b1b3a";
  const on = onColor ?? "#ffffff";
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold"
          : "inline-flex min-h-11 items-center gap-2 rounded-full bg-panel py-1 pl-2 pr-4 text-sm font-semibold text-ink ring-1 ring-ink-mute/40 transition-colors hover:ring-2 hover:ring-ink"
      }
      style={active ? { background: fill, color: on } : undefined}
    >
      {!active && color ? (
        <span
          aria-hidden
          className="size-4 rounded-full"
          style={{ background: color }}
        />
      ) : null}
      {!active && !color ? (
        <span
          aria-hidden
          className="size-4 rounded-full border-[3px] border-ink bg-panel"
        />
      ) : null}
      {children}
    </Link>
  );
}

function EmptyState({ sector }: { sector?: string }) {
  return (
    <div className="grid gap-8 rounded-lg border-2 border-dashed border-ink-mute/40 bg-panel p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <h2 className="t-h3 text-ink">
          {sector
            ? `Aucune référence publiée pour le secteur « ${sector} » pour le moment.`
            : "Les références publiées arriveront ici"}
        </h2>
        <p className="t-body mt-3 text-ink-soft">
          {sector
            ? "Essayez un autre secteur ou consultez l'ensemble des références. En attendant, nos consultants peuvent vous présenter des cas d'usage proches de votre contexte."
            : "Chaque fiche présentera la problématique d'un projet, la solution mise en œuvre et l'impact constaté. En attendant, échangeons sur votre contexte : nos consultants peuvent vous présenter des cas d'usage proches du vôtre."}
        </p>
        {sector ? (
          <p className="mt-4">
            <Link
              href="/references"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline underline-offset-4 hover:decoration-2"
            >
              Voir toutes les références
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </p>
        ) : null}
      </div>
      <PillLink href="/contact-demo?intent=contact&from=references&block=references-empty">
        Discutons de votre projet
      </PillLink>
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
    "inline-flex min-h-11 items-center gap-2 rounded-full bg-panel px-5 text-sm font-bold text-ink ring-2 ring-inset ring-ink transition-colors hover:bg-ink hover:text-white";
  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm"
    >
      <span className="t-num font-semibold text-ink-soft">
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
