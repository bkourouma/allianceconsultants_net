import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/shared/JsonLd";
import {
  ContactDemoForm,
  type OfferingOption,
} from "@/components/contact/ContactDemoForm";
import { getServices, getSiteSettings, getSolutions } from "@/lib/content";
import { buildLocalBusinessJsonLd, buildMetadata } from "@/lib/seo";
import type { LeadInput } from "@/lib/validators/lead";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Contact & Démo — Alliance Consultants",
      description:
        "Demandez une démo personnalisée de nos solutions SaaS, un diagnostic ou un échange avec nos consultants. Réponse sous 24 à 48 heures ouvrées.",
      siteUrl: `${SITE_URL}/contact-demo`,
    }),
    alternates: { canonical: `${SITE_URL}/contact-demo` },
  };
}

const VALID_INTENTS = [
  "demo",
  "contact",
  "training",
  "automation",
  "diagnostic",
] as const;

const INTENT_COPY: Record<
  LeadInput["intent"],
  { eyebrow: string; title: string; description: string; cta: string }
> = {
  demo: {
    eyebrow: "Demander une démo",
    title: "Découvrez nos solutions en conditions réelles",
    description:
      "Notre équipe organise avec vous une démonstration adaptée à votre contexte métier et à vos enjeux opérationnels.",
    cta: "Demander ma démo",
  },
  contact: {
    eyebrow: "Nous contacter",
    title: "Échangeons sur votre projet",
    description:
      "Une question, un besoin spécifique, un projet à cadrer ? Nos consultants vous répondent sous 24 à 48 heures ouvrées.",
    cta: "Envoyer ma demande",
  },
  training: {
    eyebrow: "Demande de formation",
    title: "Construisons votre parcours de formation",
    description:
      "Formations IA, développement, automatisation, GED ou SQL Server : précisez votre besoin et nous revenons vers vous avec un plan adapté.",
    cta: "Demander un devis formation",
  },
  automation: {
    eyebrow: "Automatisation IA",
    title: "Automatisons vos processus métiers",
    description:
      "Décrivez le processus que vous souhaitez automatiser. Nous évaluons la faisabilité et vous proposons un cadrage.",
    cta: "Demander un cadrage",
  },
  diagnostic: {
    eyebrow: "Diagnostic gratuit",
    title: "Un diagnostic offert par un consultant senior",
    description:
      "Un échange sans engagement pour qualifier votre besoin, identifier les leviers et baliser une trajectoire de transformation.",
    cta: "Demander mon diagnostic",
  },
};

interface PageProps {
  searchParams: Promise<{
    intent?: string;
    solution?: string;
    from?: string;
    block?: string;
  }>;
}

function parseIntent(value: string | undefined): LeadInput["intent"] {
  if (value && (VALID_INTENTS as readonly string[]).includes(value)) {
    return value as LeadInput["intent"];
  }
  return "demo";
}

export default async function ContactDemoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const intent = parseIntent(params.intent);
  const slugParam =
    params.solution && /^[a-z0-9-]+$/.test(params.solution)
      ? params.solution
      : undefined;
  const fromBlock =
    params.block && /^[a-z0-9-]+$/.test(params.block)
      ? params.block
      : "contact-demo-page";

  const [settings, solutions, services] = await Promise.all([
    getSiteSettings(),
    getSolutions().catch(() => []),
    getServices().catch(() => []),
  ]);

  const offerings: OfferingOption[] = [
    ...solutions.map((s) => ({
      value: s.slug,
      label: s.name,
      group: "Solutions" as const,
    })),
    ...services.map((s) => ({
      value: s.slug,
      label: s.title,
      group: "Services" as const,
    })),
  ];

  const matchedSolution = slugParam
    ? solutions.find((s) => s.slug === slugParam)
    : undefined;
  const solutionSlug = matchedSolution?.slug;
  const solutionName = matchedSolution?.name;

  const copy = INTENT_COPY[intent];
  const heroTitle = solutionName
    ? `Demander une démo de ${solutionName}`
    : copy.title;
  const ctaLabel = solutionName
    ? `Demander ma démo de ${solutionName}`
    : copy.cta;

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
        name: "Contact & Démo",
        item: `${SITE_URL}/contact-demo`,
      },
    ],
  };

  const localBusiness = buildLocalBusinessJsonLd(settings, SITE_URL);

  const phoneHref = (p: string) => `tel:${p.replace(/\s+/g, "")}`;
  const whatsappDigits = settings.contact.whatsapp?.replace(/\D/g, "");

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={localBusiness} />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 100% 0%, rgba(59,130,246,0.18), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
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
              <li className="font-medium text-slate-700">Contact &amp; Démo</li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {copy.description}
          </p>
        </div>
      </section>

      <Section bg="white" padding="md">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:gap-14">
          <div>
            <ContactDemoForm
              intent={intent}
              solutionSlug={solutionSlug}
              fromBlock={fromBlock}
              ctaLabel={ctaLabel}
              offerings={offerings}
            />
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Nous joindre directement
              </h2>
              <dl className="mt-5 space-y-4 text-sm text-slate-700">
                <div>
                  <dt className="font-medium text-slate-900">E-mail</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${settings.contact.email}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {settings.contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Téléphone</dt>
                  <dd className="mt-1 space-y-1">
                    {settings.contact.phones.map((p) => (
                      <div key={p}>
                        <a
                          href={phoneHref(p)}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {p}
                        </a>
                      </div>
                    ))}
                  </dd>
                </div>
                {whatsappDigits && (
                  <div>
                    <dt className="font-medium text-slate-900">WhatsApp</dt>
                    <dd className="mt-1">
                      <a
                        href={`https://wa.me/${whatsappDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {settings.contact.whatsapp}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-slate-900">Adresse</dt>
                  <dd className="mt-1">{settings.contact.address.street}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Horaires</dt>
                  <dd className="mt-1">
                    Lundi&nbsp;–&nbsp;Vendredi, 8&nbsp;h&nbsp;–&nbsp;18&nbsp;h (GMT)
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Ce que vous obtiendrez
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <Check /> Un échange qualifié avec un consultant senior
                </li>
                <li className="flex gap-3">
                  <Check /> Une démonstration adaptée à votre contexte
                </li>
                <li className="flex gap-3">
                  <Check /> Une estimation indicative et un plan d&apos;action
                </li>
                <li className="flex gap-3">
                  <Check /> Aucune relance commerciale intrusive
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Check() {
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
