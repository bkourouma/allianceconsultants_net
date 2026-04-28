import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { getSiteSettings } from "@/lib/content";
import { buildMetadata, buildOrganizationJsonLd } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "À propos d'Alliance Consultants — éditeur africain de SaaS, IA et services",
      description:
        "Depuis 2003, Alliance Consultants accompagne les organisations d'Afrique francophone dans leur transformation digitale : SaaS métiers, IA, dématérialisation et formations.",
      siteUrl: `${SITE_URL}/a-propos`,
    }),
    alternates: { canonical: `${SITE_URL}/a-propos` },
  };
}

const KEY_FIGURES = [
  { value: "20+", label: "années d'expertise terrain" },
  { value: "6", label: "plateformes SaaS éditées" },
  { value: "100+", label: "projets de transformation livrés" },
  { value: "8", label: "pays d'Afrique francophone servis" },
];

const VALUES = [
  {
    title: "Proximité africaine",
    description:
      "Basés à Abidjan, nous concevons et opérons nos solutions au plus près des réalités locales : connectivité, langues, devises, conformité et usages métiers africains.",
  },
  {
    title: "Excellence technique",
    description:
      "Microsoft .NET, SQL Server, IA générative, automatisation n8n : nous combinons des standards éprouvés avec les technologies de rupture pour livrer des produits robustes et performants.",
  },
  {
    title: "Engagement de long terme",
    description:
      "Nos clients restent à nos côtés pendant des années. Nous traitons chaque mission comme un partenariat, pas comme une transaction — du cadrage AMOA à la maintenance applicative.",
  },
  {
    title: "Souveraineté des données",
    description:
      "Hébergement maîtrisé, contrats clairs, journalisation et chiffrement : vos données restent les vôtres. Nous prenons les enjeux RGPD et de confidentialité au sérieux.",
  },
];

const EXPERTISE = [
  {
    title: "Édition SaaS",
    description:
      "DocuPro Suite, MedicPro, CliniquePro, ImmoTopia.cloud, Annonces Web et École Digitale : un écosystème de plateformes métiers couvrant la GED, la santé, l'immobilier et la formation.",
  },
  {
    title: "IA & automatisation",
    description:
      "Chatbots métiers, agents IA, automatisation de processus avec n8n et intégration de LLM dans vos systèmes existants pour gagner en productivité.",
  },
  {
    title: "Dématérialisation & GED",
    description:
      "Numérisation de fonds documentaires, intégration de scanners professionnels, gouvernance documentaire et workflows électroniques.",
  },
  {
    title: "Développement spécifique & AMOA",
    description:
      "Conception et développement d'applications métiers sur mesure, accompagnement à la maîtrise d'ouvrage, audit technique et conduite du changement.",
  },
  {
    title: "Formations professionnelles",
    description:
      "IA en entreprise, développement web .NET, SQL Server, automatisation n8n, GED et archivage — formations animées par des praticiens en activité.",
  },
];

const MILESTONES = [
  {
    year: "2003",
    title: "Création d'Alliance Consultants",
    description:
      "Fondation à Abidjan autour d'une promesse : apporter aux organisations africaines une expertise technique de niveau international.",
  },
  {
    year: "2008",
    title: "Premier produit SaaS — DocuPro",
    description:
      "Lancement de la plateforme de gestion électronique de documents qui deviendra DocuPro Suite, déployée chez des dizaines de clients privés et publics.",
  },
  {
    year: "2015",
    title: "Pôle dématérialisation & scanners",
    description:
      "Structuration de l'offre numérisation : intégration de scanners professionnels, prestations de dématérialisation et gouvernance documentaire.",
  },
  {
    year: "2020",
    title: "Extension à la santé et à l'immobilier",
    description:
      "Lancement de MedicPro et CliniquePro pour le secteur médical et d'ImmoTopia.cloud pour la gestion immobilière.",
  },
  {
    year: "2024",
    title: "Tournant IA & automatisation",
    description:
      "Création d'une practice dédiée à l'IA générative, à l'automatisation n8n et à l'intégration d'agents intelligents dans les processus métiers.",
  },
  {
    year: "2026",
    title: "École Digitale & ouverture régionale",
    description:
      "Industrialisation des formations IA et développement à travers École Digitale, et accélération sur l'ensemble de l'Afrique francophone.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

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
        name: "À propos",
        item: `${SITE_URL}/a-propos`,
      },
    ],
  };

  const orgJsonLd = buildOrganizationJsonLd(settings, SITE_URL);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={orgJsonLd} />

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
              <li className="font-medium text-slate-700">À propos</li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Notre maison
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Éditeur et intégrateur africain de solutions SaaS, IA et métiers
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Depuis {new Date().getFullYear() - settings.brand.foundingYear} ans,
            Alliance Consultants conçoit, édite et opère des plateformes
            logicielles et des services experts pour accompagner les
            organisations d&apos;Afrique francophone dans leur transformation
            digitale.
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {KEY_FIGURES.map((figure) => (
              <div
                key={figure.label}
                className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur"
              >
                <dt className="text-sm text-slate-500">{figure.label}</dt>
                <dd className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                  {figure.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section bg="white" padding="md">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Notre mission
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Donner aux organisations africaines les outils logiciels qu&apos;elles méritent
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Pendant longtemps, le marché logiciel africain s&apos;est
              contenté d&apos;importer des solutions pensées pour
              d&apos;autres contextes — souvent trop chères, trop rigides, ou
              déconnectées des réalités opérationnelles locales.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Alliance Consultants prend le contre-pied de cette logique. Nous
              éditons nos propres plateformes SaaS, nous formons les talents
              locaux, et nous intégrons l&apos;IA dans les processus métiers de
              nos clients pour qu&apos;ils gagnent en autonomie, en
              productivité et en compétitivité.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Notre vision
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Un écosystème logiciel africain souverain et de niveau mondial
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Nous croyons qu&apos;une transformation digitale durable passe
              par trois piliers indissociables : des produits SaaS robustes
              conçus en Afrique, une montée en compétences continue des
              équipes, et une intégration intelligente de l&apos;IA dans les
              opérations quotidiennes.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Notre ambition : faire d&apos;Alliance Consultants la maison de
              référence pour l&apos;édition logicielle, les services experts
              et la formation IA en Afrique francophone.
            </p>
          </div>
        </div>
      </Section>

      <Section bg="gray" padding="md">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Nos valeurs
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Quatre principes qui guident nos engagements
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <article
              key={value.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section bg="white" padding="md">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Nos expertises
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Cinq pôles complémentaires au service de votre transformation
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            Du diagnostic stratégique à l&apos;exploitation quotidienne, nos
            équipes couvrent l&apos;ensemble de la chaîne de valeur logicielle.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERTISE.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-primary hover:bg-white hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section bg="gray" padding="md">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Notre histoire
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Une trajectoire au service du logiciel africain
          </h2>
        </div>
        <ol className="mt-12 space-y-6 border-l-2 border-primary/20 pl-6">
          {MILESTONES.map((milestone) => (
            <li key={milestone.year} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-white"
              />
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {milestone.year}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {milestone.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {milestone.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section bg="white" padding="md">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Notre équipe
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Des praticiens expérimentés, ancrés à Abidjan
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Notre équipe rassemble des architectes logiciels, des
              développeurs full-stack .NET et web, des spécialistes IA et
              automatisation, des consultants AMOA, des chefs de projet
              certifiés et des formateurs en activité.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Chaque mission est portée par un binôme expert métier / expert
              technique, supervisé par un directeur de projet — pour garantir
              la cohérence entre la valeur livrée et la maîtrise technique.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Nous formons également la prochaine génération de talents
              africains à travers <strong>École Digitale</strong>, notre pôle
              de formation continue dédié à l&apos;IA, au développement et aux
              métiers du numérique.
            </p>
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <h3 className="text-lg font-semibold text-slate-900">
              Nous travaillons avec
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Administrations publiques et collectivités</li>
              <li>• Établissements de santé (hôpitaux, cliniques)</li>
              <li>• Banques, assurances et institutions financières</li>
              <li>• Acteurs de l&apos;immobilier et de la promotion</li>
              <li>• ETI, PME et groupes industriels</li>
              <li>• Cabinets de conseil et organisations internationales</li>
            </ul>
            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-500">
                Basés à <strong>{settings.contact.address.city}</strong>,
                {" "}{settings.contact.address.country === "CI"
                  ? "Côte d'Ivoire"
                  : settings.contact.address.country}.
                Interventions dans toute l&apos;Afrique francophone.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                <Link
                  href="/references"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Voir nos références clients →
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <section
        aria-labelledby="about-cta-title"
        className="relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 80% 0%, rgba(255,255,255,0.25), transparent 70%), radial-gradient(50% 60% at 10% 100%, rgba(255,255,255,0.18), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="about-cta-title"
              className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Parlons de votre projet de transformation digitale
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Diagnostic gratuit, échange sans engagement avec un consultant
              senior. Réponse sous 24 h ouvrées.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <CTAButton
                intent="contact"
                label="Nous contacter"
                block="final-cta"
                size="lg"
                onDark
              />
              <CTAButton
                intent="diagnostic"
                label="Demander un diagnostic"
                block="final-cta"
                size="lg"
                variant="secondary"
                onDark
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
