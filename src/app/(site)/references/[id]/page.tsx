import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { Perforation } from "@/components/about/CouponKit";
import { PillLink } from "@/components/about/PillLink";
import {
  getPublishedProjectReferenceById,
  listLatestPublishedProjectReferences,
} from "@/lib/projectReferences";
import { getSiteSettings } from "@/lib/content";
import {
  buildCaseStudyJsonLd,
  buildMetadata,
  buildReferencesBreadcrumbJsonLd,
} from "@/lib/seo";
import { ReferenceTicket } from "../ReferenceTicket";

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

  const sections: { title: string; body: string }[] = [
    { title: "Problématique", body: ref.problem },
    { title: "Solution proposée", body: ref.solution },
  ];
  if (ref.impact) sections.push({ title: "Impact / résultat", body: ref.impact });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={caseStudyJsonLd} />

      {/* ───────── En-tête ───────── */}
      <section className="bg-enamel pb-12 pt-8 lg:pb-16 lg:pt-10">
        <div className="wrap">
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

      {/* ───────── Corps : fiche d'identité + problématique / solution / impact ───────── */}
      <section className="bg-enamel pb-16 lg:pb-24">
        <div className="wrap grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
          <aside
            aria-label="Fiche d'identité du projet"
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <div className="coupon overflow-hidden">
              <div className="flex h-11 border-b-2 border-ink bg-ink text-white">
                <span className="t-num grid min-w-[4.25rem] place-items-center border-r-2 border-ink bg-panel px-3 font-display text-xl font-extrabold text-ink">
                  {ref.year}
                </span>
                <span className="t-field flex min-w-0 flex-1 items-center truncate px-4 !text-white">
                  {ref.sector ?? "Référence"}
                </span>
              </div>
              <div className="flex items-center gap-3 border-b-2 border-dashed border-ink px-5 py-4">
                {ref.logoUrl ? (
                  <span className="grid h-14 max-w-[10rem] place-items-center rounded-[3px] border border-ink-mute/60 bg-white px-3">
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
                    className="grid size-14 place-items-center rounded-[3px] border-2 border-ink bg-white font-display text-2xl font-extrabold text-ink"
                  >
                    {ref.companyName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <dl className="px-5">
                <Row label="Client">{ref.companyName}</Row>
                <Row label="Année">{ref.year}</Row>
                <Row label="Durée" last>
                  {ref.duration}
                </Row>
              </dl>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="coupon overflow-hidden">
              {sections.map((s, i) => (
                <div key={s.title}>
                  {i > 0 ? <Perforation /> : null}
                  <section className="p-6 sm:p-8 lg:p-10">
                    <h2 className="t-h3 text-ink">{s.title}</h2>
                    <div className="mt-4 grid max-w-[68ch] gap-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                      {renderParagraphs(s.body)}
                    </div>
                  </section>
                </div>
              ))}
            </div>

            <aside className="coupon mt-10 grid overflow-hidden sm:grid-cols-[minmax(0,1fr)_16rem] lg:mt-14">
              <div className="p-6 sm:p-8">
                <h2 className="t-h3 text-ink">Un projet similaire à mener ?</h2>
                <p className="mt-3 max-w-[52ch] text-ink-soft">
                  Discutons de votre contexte. Nos consultants vous accompagnent
                  pour cadrer, prototyper et déployer votre projet de
                  transformation digitale.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 sm:border-l-2 sm:border-t-0">
                <p className="t-field !text-carbon">Coupon détachable</p>
                <PillLink
                  className="w-full"
                  href={`/contact-demo?intent=contact&block=references-cta`}
                >
                  Prendre contact
                </PillLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-enamel pb-20 lg:pb-28">
          <div className="wrap">
            <hr className="tear" />
            <div className="mb-8 mt-12 flex flex-wrap items-end justify-between gap-4 lg:mt-16">
              <h2 className="t-h3 text-ink">Autres références</h2>
              <Link
                href="/references"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline underline-offset-4 hover:decoration-2"
              >
                Toutes les références
                <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
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
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={
        "py-4 " + (last ? "" : "border-b border-dashed border-ink-mute/60")
      }
    >
      <dt className="t-field">{label}</dt>
      <dd className="mt-1 font-display text-xl font-bold leading-snug text-ink">
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
      <ul key={`ul-${key++}`} className="list-disc space-y-1.5 pl-5 marker:text-ink-mute">
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
