import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/JsonLd";
import { ProjectReferenceCard } from "@/components/references/ProjectReferenceCard";
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

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={caseStudyJsonLd} />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-dark text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(50% 60% at 100% 0%, rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <nav className="text-sm text-white/70">
            <Link href="/references" className="hover:text-white">
              ← Toutes les références
            </Link>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {ref.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ref.logoUrl}
                alt={`Logo ${ref.companyName}`}
                className="h-14 max-w-[10rem] rounded-md bg-white/95 object-contain px-3 py-1.5"
              />
            ) : null}
            {ref.sector ? (
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/85">
                {ref.sector}
              </span>
            ) : null}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {ref.companyName}
          </p>
          <h1 className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {ref.projectTitle}
          </h1>

          <dl className="mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            <KeyValue label="Année">{ref.year}</KeyValue>
            <KeyValue label="Durée">{ref.duration}</KeyValue>
          </dl>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Block title="Problématique" tone="neutral">
          {ref.problem}
        </Block>

        <Block title="Solution proposée" tone="primary">
          {ref.solution}
        </Block>

        {ref.impact ? (
          <Block title="Impact / résultat" tone="success">
            {ref.impact}
          </Block>
        ) : null}

        <aside className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Un projet similaire à mener ?
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Discutons de votre contexte
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Nos consultants vous accompagnent pour cadrer, prototyper et
            déployer votre projet de transformation digitale.
          </p>
          <Link
            href={`/contact-demo?intent=contact&fromPage=${encodeURIComponent(`/references/${id}`)}&fromBlock=references-cta`}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Prendre contact
          </Link>
        </aside>
      </article>

      {others.length > 0 ? (
        <section className="bg-slate-50 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Autres références
              </h2>
              <Link
                href="/references"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Toutes les références →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((r) => (
                <ProjectReferenceCard key={r.id} reference={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function KeyValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/60">
        {label}
      </dt>
      <dd className="mt-1 text-base font-medium text-white">{children}</dd>
    </div>
  );
}

function Block({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "neutral" | "primary" | "success";
  children: string;
}) {
  const toneCls =
    tone === "primary"
      ? "border-primary/15 bg-primary/[0.04]"
      : tone === "success"
        ? "border-emerald-200/70 bg-emerald-50/40"
        : "border-slate-200/70 bg-white";

  return (
    <section
      className={`mb-8 rounded-2xl border ${toneCls} p-6 sm:p-8 last:mb-0`}
    >
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <div className="prose prose-slate mt-4 max-w-none text-base leading-relaxed text-slate-700">
        {renderParagraphs(children)}
      </div>
    </section>
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
      <ul key={`ul-${key++}`} className="list-disc pl-5">
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
