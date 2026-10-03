import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { PillLink } from "@/components/about/PillLink";
import {
  getPublishedProjectReferenceById,
  listLatestPublishedProjectReferences,
} from "@/lib/projectReferences";
import { getSiteSettings } from "@/lib/content";
import { lineStyle } from "@/lib/network";
import {
  buildCaseStudyJsonLd,
  buildMetadata,
  buildReferencesBreadcrumbJsonLd,
} from "@/lib/seo";
import { ReferenceTicket, lineForSector } from "../ReferenceTicket";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const ref = await getPublishedProjectReferenceById(id);
  if (!ref) {
    return {
      title: "Référence introuvable",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/references/${id}`;
  const title = `${ref.companyName} — ${ref.projectTitle}`;
  const description = oneLine(
    [ref.problem, ref.solution].join(" — "),
    155,
  );

  return {
    ...buildMetadata({
      title,
      description,
      ogImage: ref.logoUrl ?? undefined,
      siteUrl: url,
    }),
    alternates: { canonical: url },
  };
}

export default async function ReferenceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ref = await getPublishedProjectReferenceById(id);
  if (!ref) {
    notFound();
  }

  const [settings, latest] = await Promise.all([
    getSiteSettings(),
    listLatestPublishedProjectReferences(4),
  ]);

  const breadcrumbJsonLd = buildReferencesBreadcrumbJsonLd({
    siteUrl: SITE_URL,
    referenceId: id,
    referenceTitle: `${ref.companyName} — ${ref.projectTitle}`,
  });
  const caseStudyJsonLd = buildCaseStudyJsonLd({
    id,
    companyName: ref.companyName,
    projectTitle: ref.projectTitle,
    year: ref.year,
    problem: ref.problem,
    solution: ref.solution,
    impact: ref.impact,
    siteUrl: SITE_URL,
    organizationName: settings.brand.name,
    organizationLogo: new URL(settings.brand.logoUrl, SITE_URL).toString(),
    updatedAt: ref.updatedAt,
  });

  const others = latest.filter((r) => r.id !== id).slice(0, 3);
  const line = lineForSector(ref.sector);

  const stations: { title: string; body: string }[] = [
    { title: "Problématique", body: ref.problem },
    { title: "Solution proposée", body: ref.solution },
  ];
  if (ref.impact) stations.push({ title: "Impact / résultat", body: ref.impact });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={caseStudyJsonLd} />

      {/* ───────── En-tête : la ligne du secteur ───────── */}
      <section className="bg-enamel" style={lineStyle(line.id)}>
        <div className="h-3 bg-[var(--accent)]" aria-hidden />
        <div className="wrap pb-12 pt-8 lg:pb-16 lg:pt-10">
          <Link
            href="/references"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
            Toutes les références
          </Link>

          <h1 className="t-display mt-6 max-w-[20ch] text-ink lg:mt-8">
            {ref.projectTitle}
          </h1>
          <p className="t-lead mt-5 font-medium text-ink">
            {ref.companyName}
          </p>
        </div>
      </section>

      {/* ───────── Corps : fiche d'identité + stations ───────── */}
      <section className="bg-panel py-14 lg:py-20" style={lineStyle(line.id)}>
        <div className="wrap grid gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-20">
          <aside aria-label="Fiche d'identité du projet" className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-lg ring-1 ring-rule">
              <div className="flex items-center gap-3 bg-[var(--accent)] p-5 text-[var(--on-accent)]">
                {ref.logoUrl ? (
                  <span className="grid h-14 max-w-[10rem] place-items-center rounded-[4px] bg-white px-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ref.logoUrl}
                      alt={`Logo ${ref.companyName}`}
                      className="max-h-10 max-w-full object-contain"
                    />
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="grid size-14 place-items-center rounded-full bg-white font-display text-xl font-extrabold text-ink"
                  >
                    {ref.companyName.charAt(0).toUpperCase()}
                  </span>
                )}
                {ref.sector ? (
                  <p className="text-sm font-bold leading-tight">
                    {ref.sector}
                  </p>
                ) : null}
              </div>
              <dl className="divide-y divide-dashed divide-rule bg-panel px-5">
                <Row label="Client">{ref.companyName}</Row>
                <Row label="Année">{ref.year}</Row>
                <Row label="Durée">{ref.duration}</Row>
              </dl>
            </div>
          </aside>

          <div>
            <ol className="relative grid gap-12">
              <span
                aria-hidden
                className="absolute bottom-3 left-[0.6875rem] top-3 w-1.5 rounded-full bg-[var(--accent)]"
              />
              {stations.map((s) => (
                <li key={s.title} className="relative pl-12">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0.5 block size-7 rounded-full border-[5px] border-ink bg-panel"
                  />
                  <h2 className="t-h3 text-ink">{s.title}</h2>
                  <div className="mt-4 grid max-w-[68ch] gap-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                    {renderParagraphs(s.body)}
                  </div>
                </li>
              ))}
            </ol>

            <aside className="mt-16 rounded-lg bg-night p-7 text-white sm:p-9">
              <h2 className="t-h3 text-white">Un projet similaire à mener ?</h2>
              <p className="mt-3 max-w-[52ch] text-white/80">
                Discutons de votre contexte. Nos consultants vous accompagnent
                pour cadrer, prototyper et déployer votre projet de
                transformation digitale.
              </p>
              <div className="mt-6">
                <PillLink
                  onDark
                  href={`/contact-demo?intent=contact&from=references&block=references-cta`}
                >
                  Prendre contact
                </PillLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-enamel py-14 lg:py-20">
          <div className="wrap">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="t-h3 text-ink">Autres références</h2>
              <Link
                href="/references"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline underline-offset-4 hover:decoration-2"
              >
                Toutes les références
                <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
              {others.map((r) => (
                <ReferenceTicket key={r.id} reference={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <dt className="t-station text-ink-mute">{label}</dt>
      <dd className="mt-1 font-display text-lg font-bold leading-snug text-ink">
        {children}
      </dd>
    </div>
  );
}

/**
 * Convertit un texte multi-lignes en paragraphes / listes simples.
 * Une ligne commençant par "- " ou "• " devient un item de liste.
 */
function renderParagraphs(input: string): React.ReactNode {
  const lines = input.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let buffer: string[] = [];
  let listBuffer: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (buffer.length === 0) return;
    blocks.push(
      <p key={`p-${key++}`} className="whitespace-pre-line">
        {buffer.join(" ").trim()}
      </p>,
    );
    buffer = [];
  }
  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc space-y-1.5 pl-5 marker:text-ink">
        {listBuffer.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }
    const bullet = /^([-•·*])\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      listBuffer.push(bullet[2]);
    } else {
      flushList();
      buffer.push(line);
    }
  }
  flushList();
  flushParagraph();

  return blocks.length > 0 ? blocks : input;
}

function oneLine(input: string, max: number): string {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}
