import type { Metadata } from "next";
import Link from "next/link";
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

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={localBusiness} />

      <section className="bg-enamel pb-20 pt-8 lg:pb-28 lg:pt-12">
        <div className="wrap">
          <nav aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-mute">
              <li>
                <Link
                  href="/"
                  className="font-medium underline-offset-4 hover:text-ink hover:underline"
                >
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-ink">
                {copy.eyebrow}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
            <h1 className="t-display max-w-[18ch] text-ink">{heroTitle}</h1>
            <p className="t-lead border-t-2 border-ink pt-5 lg:mb-2">
              {copy.description}
            </p>
          </div>

          <div className="mt-10 lg:mt-14">
            <ContactDemoForm
              intent={intent}
              solutionSlug={solutionSlug}
              fromBlock={fromBlock}
              ctaLabel={ctaLabel}
              offerings={offerings}
              contact={{
                email: settings.contact.email,
                phones: settings.contact.phones,
                whatsapp: settings.contact.whatsapp,
                address: settings.contact.address.street,
                hours: "Lundi – Vendredi, 8 h – 18 h (GMT)",
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
