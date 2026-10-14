import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import {
  PassportTimeline,
  type Milestone,
} from "@/components/about/PassportTimeline";
import { SectorSelector } from "@/components/about/SectorSelector";
import { Reveal } from "@/components/fx/Reveal";
import { getSiteSettings } from "@/lib/content";
import { ACADEMIE, getLine } from "@/lib/network";
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

const VALUES = [
  {
    title: "Proximité africaine",
    description:
      "Basés à Abidjan, nous concevons et opérons nos solutions au plus près des réalités locales : connectivité, langues, devises, conformité et usages métiers africains.",
    color: "#1457f5",
  },
  {
    title: "Excellence technique",
    description:
      "Microsoft .NET, SQL Server, IA générative, automatisation n8n : nous combinons des standards éprouvés avec les technologies de rupture pour livrer des produits robustes et performants.",
    color: "#098240",
  },
  {
    title: "Engagement de long terme",
    description:
      "Nos clients restent à nos côtés pendant des années. Nous traitons chaque mission comme un partenariat, pas comme une transaction — du cadrage AMOA à la maintenance applicative.",
    color: "#f26a1b",
  },
  {
    title: "Souveraineté des données",
    description:
      "Hébergement maîtrisé, contrats clairs, journalisation et chiffrement : vos données restent les vôtres. Nous prenons les enjeux RGPD et de confidentialité au sérieux.",
    color: "#e0245e",
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
      "Numérisation de fonds documentaires, conseil et méthode de dématérialisation, intégration à la GED, gouvernance documentaire et workflows électroniques.",
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

const MILESTONES: Milestone[] = [
  {
    year: "2003",
    title: "Création d'Alliance Consultants",
    description:
      "Fondation à Abidjan autour d'une promesse : apporter aux organisations africaines une expertise technique de niveau international.",
    color: "#0f2a5a",
  },
  {
    year: "2008",
    title: "Premier produit SaaS — DocuPro",
    description:
      "Lancement de la plateforme de gestion électronique de documents qui deviendra DocuPro Suite.",
    color: getLine("docupro")?.color ?? "#1457f5",
  },
  {
    year: "2015",
    title: "Pôle numérisation & dématérialisation",
    description:
      "Structuration de l'offre numérisation : conseil et méthode, prestations de dématérialisation et gouvernance documentaire.",
    color: getLine("cliniquepro")?.color ?? "#00789a",
  },
  {
    year: "2020",
    title: "Extension à la santé et à l'immobilier",
    description:
      "Lancement de MedicPro (gestion réglementaire pharmaceutique), de CliniquePro (cliniques, centres de santé et cabinets médicaux) et d'ImmoTopia.cloud pour la gestion immobilière.",
    color: getLine("medicpro")?.color ?? "#098240",
  },
  {
    year: "2024",
    title: "Tournant IA & automatisation",
    description:
      "Création d'une practice dédiée à l'IA générative, à l'automatisation n8n et à l'intégration d'agents intelligents dans les processus métiers.",
    color: ACADEMIE.color,
  },
  {
    year: "2026",
    title: "École Digitale & ouverture régionale",
    description:
      "Industrialisation des formations IA et développement à travers École Digitale, et accélération sur l'ensemble de l'Afrique francophone.",
    color: getLine("ecole")?.color ?? "#f5b800",
  },
];

const CONTACT_ROW =
  "group flex min-h-14 items-center gap-4 border-b border-dashed border-ink-mute/50 px-5 py-3 transition-colors duration-200 hover:bg-panel sm:px-7";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const { contact } = settings;
  const whatsappDigits = contact.whatsapp?.replace(/\D/g, "");

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

      {/* ───────── L'histoire : titre et fiche d'identité ───────── */}
      <section className="bg-enamel pb-16 pt-8 lg:pb-24 lg:pt-12">
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
              <li className="font-semibold text-ink">À propos</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end lg:gap-16">
            <div>
              <h1 className="t-display max-w-[17ch] text-ink">
                Éditeur et intégrateur africain de solutions SaaS, IA et métiers
              </h1>
              <p className="t-lead mt-6">
                Depuis {settings.brand.foundingYear}, Alliance Consultants
                conçoit, édite et opère des plateformes logicielles et des
                services experts pour accompagner les organisations
                d&apos;Afrique francophone dans leur transformation digitale.
              </p>
            </div>

            <aside
              aria-label="Fiche d'identité"
              className="coupon overflow-hidden"
            >
              <div className="bg-ink px-5 py-2.5 text-white">
                <p className="t-field !text-white">Fiche d&apos;identité</p>
              </div>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)]">
                <div className="col-span-2 grid grid-cols-subgrid items-end gap-4 border-b border-dashed border-ink-mute/60 px-5 py-4">
                  <dt className="t-field">Fondée en</dt>
                  <dd className="t-num text-right font-display text-5xl font-extrabold italic leading-none text-carbon">
                    {settings.brand.foundingYear}
                  </dd>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid items-baseline gap-4 border-b border-dashed border-ink-mute/60 px-5 py-3.5">
                  <dt className="t-field">Siège</dt>
                  <dd className="text-right font-display text-xl font-bold leading-tight text-ink">
                    {contact.address.street}
                  </dd>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid items-baseline gap-4 border-b border-dashed border-ink-mute/60 px-5 py-3.5">
                  <dt className="t-field">Zone</dt>
                  <dd className="text-right font-display text-xl font-bold leading-tight text-ink">
                    Afrique francophone
                  </dd>
                </div>
                <div className="col-span-2 grid grid-cols-subgrid items-baseline gap-4 px-5 py-3.5">
                  <dt className="t-field">Offre</dt>
                  <dd className="text-right font-display text-xl font-bold leading-tight text-ink">
                    SaaS, IA, formations
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* ───────── La conviction ───────── */}
      <section className="bg-enamel pb-16 lg:pb-24">
        <div className="wrap">
          <hr className="tear" />
          <div className="grid gap-12 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-24">
            <Reveal>
              <h2 className="t-h2 max-w-[22ch] text-ink">
                Donner aux organisations africaines les outils logiciels qu&apos;elles méritent
              </h2>
              <div className="mt-8 grid gap-5 text-[1.0625rem] leading-relaxed text-ink-soft">
                <p className="t-body">
                  Pendant longtemps, le marché logiciel africain s&apos;est
                  contenté d&apos;importer des solutions pensées pour d&apos;autres
                  contextes — souvent trop chères, trop rigides, ou déconnectées
                  des réalités opérationnelles locales.
                </p>
                <p className="t-body">
                  Alliance Consultants prend le contre-pied de cette logique. Nous
                  éditons nos propres plateformes SaaS, nous formons les talents
                  locaux, et nous intégrons l&apos;IA dans les processus métiers
                  de nos clients pour qu&apos;ils gagnent en autonomie, en
                  productivité et en compétitivité.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120} className="self-start">
              <div className="coupon overflow-hidden">
                <div className="bg-ink px-5 py-2.5 sm:px-8">
                  <p className="t-field !text-white">Notre conviction</p>
                </div>
                <div className="p-6 sm:p-8">
                  <h2 className="t-h3 text-ink">
                    Un écosystème logiciel africain souverain et de niveau mondial
                  </h2>
                  <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">
                    Nous croyons qu&apos;une transformation digitale durable passe
                    par trois piliers indissociables : des produits SaaS robustes
                    conçus en Afrique, une montée en compétences continue des
                    équipes, et une intégration intelligente de l&apos;IA dans les
                    opérations quotidiennes.
                  </p>
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                    Notre ambition : faire d&apos;Alliance Consultants la maison de
                    référence pour l&apos;édition logicielle, les services experts
                    et la formation IA en Afrique francophone.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────── Le passeport : l'histoire ───────── */}
      <section
        aria-labelledby="history-title"
        className="bg-enamel pb-16 lg:pb-24"
      >
        <div className="wrap">
          <hr className="tear" />
          <h2 id="history-title" className="t-h2 mt-16 max-w-[24ch] text-ink lg:mt-24">
            Une trajectoire au service du logiciel africain
          </h2>
          <Reveal className="mt-10 lg:mt-14">
            <PassportTimeline
              milestones={MILESTONES}
              label="Histoire d'Alliance Consultants"
            />
          </Reveal>
        </div>
      </section>

      {/* ───────── L'équipe et les pôles ───────── */}
      <section className="bg-enamel pb-16 lg:pb-24">
        <div className="wrap">
          <hr className="tear" />
          <div className="grid gap-12 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-24">
            <div>
              <h2 className="t-h2 max-w-[18ch] text-ink">
                Des praticiens expérimentés, ancrés à Abidjan
              </h2>
              <div className="mt-8 grid gap-5 text-[1.0625rem] leading-relaxed text-ink-soft">
                <p className="t-body">
                  Notre équipe rassemble des architectes logiciels, des
                  développeurs full-stack .NET et web, des spécialistes IA et
                  automatisation, des consultants AMOA, des chefs de projet
                  certifiés et des formateurs en activité.
                </p>
                <p className="t-body">
                  Chaque mission est portée par un binôme expert métier / expert
                  technique, supervisé par un directeur de projet — pour garantir
                  la cohérence entre la valeur livrée et la maîtrise technique.
                </p>
                <p className="t-body">
                  Nous formons également la prochaine génération de talents
                  africains à travers <strong className="text-ink">École Digitale</strong>, notre pôle
                  de formation continue dédié à l&apos;IA, au développement et
                  aux métiers du numérique.
                </p>
              </div>
            </div>

            <div className="coupon self-start overflow-hidden">
              <div className="bg-ink px-5 py-4 sm:px-8">
                <h3 className="t-h3 text-white">
                  Cinq pôles complémentaires au service de votre transformation
                </h3>
              </div>
              <p className="border-b-2 border-dashed border-ink px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-soft sm:px-8">
                Du diagnostic stratégique à l&apos;exploitation quotidienne, nos
                équipes couvrent l&apos;ensemble de la chaîne de valeur
                logicielle.
              </p>
              <dl>
                {EXPERTISE.map((item) => (
                  <div
                    key={item.title}
                    className="grid gap-1 border-b border-dashed border-ink-mute/50 px-5 py-4 last:border-b-0 sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:gap-6 sm:px-8"
                  >
                    <dt className="font-display text-lg font-bold leading-snug text-ink">
                      {item.title}
                    </dt>
                    <dd className="text-[0.9375rem] leading-relaxed text-ink-soft">
                      {item.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Les secteurs ───────── */}
      <section
        aria-labelledby="sectors-title"
        className="bg-enamel pb-16 lg:pb-24"
      >
        <div className="wrap">
          <hr className="tear" />
          <h2 id="sectors-title" className="t-h2 mt-16 max-w-[26ch] text-ink lg:mt-24">
            Nous travaillons avec…
          </h2>
          <p className="t-lead mt-5">
            Choisissez votre secteur : les produits qui vous concernent
            s&apos;allument.
          </p>
          <div className="mt-10 lg:mt-14">
            <SectorSelector />
          </div>
          <p className="mt-8 text-sm text-ink-mute">
            <Link
              href="/references"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline underline-offset-4 hover:decoration-2"
            >
              Voir nos références clients
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </p>
        </div>
      </section>

      {/* ───────── Les valeurs ───────── */}
      <section
        aria-labelledby="values-title"
        className="bg-enamel pb-16 lg:pb-24"
      >
        <div className="wrap">
          <hr className="tear" />
          <div className="grid gap-10 pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-24">
            <h2
              id="values-title"
              className="t-h2 max-w-[16ch] text-ink lg:sticky lg:top-32 lg:self-start"
            >
              Quatre principes qui guident nos engagements
            </h2>
            <ul className="coupon self-start overflow-hidden">
              {VALUES.map((v) => (
                <li
                  key={v.title}
                  className="grid gap-2 border-b-2 border-dashed border-ink px-5 py-6 last:border-b-0 sm:px-8 sm:py-7"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-3 w-5 shrink-0 rounded-[2px] border border-ink"
                      style={{ background: v.color }}
                    />
                    <h3 className="t-h3 text-ink">{v.title}</h3>
                  </div>
                  <p className="t-body text-[1.0625rem] leading-relaxed text-ink-soft">
                    {v.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Abidjan : bureau et contact ───────── */}
      <section
        aria-labelledby="offices-title"
        className="bg-enamel pb-16 lg:pb-24"
      >
        <div className="wrap">
          <hr className="tear" />
          <div className="coupon mt-16 grid overflow-hidden lg:mt-24 lg:grid-cols-2">
            <div className="p-6 sm:p-10 lg:p-12">
              <p className="t-field">Notre bureau</p>
              <h2 id="offices-title" className="t-h2 mt-3 text-ink">
                {contact.address.city}
              </h2>
              <p className="mt-3 font-display text-2xl font-bold text-ink">
                {contact.address.street}
              </p>
              <p className="mt-5 max-w-[40ch] text-[1.0625rem] leading-relaxed text-ink-soft">
                Basés à <strong className="text-ink">{contact.address.city}</strong>, Côte
                d&apos;Ivoire. Interventions dans toute l&apos;Afrique
                francophone.
              </p>
              <p className="mt-6 flex items-center gap-3 text-[0.9375rem] text-ink-soft">
                <Clock aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                Lundi&nbsp;–&nbsp;Vendredi, 8&nbsp;h&nbsp;–&nbsp;18&nbsp;h (GMT)
              </p>
            </div>

            <ul className="flex flex-col justify-center border-t-2 border-dashed border-ink bg-[#f6f5fb] lg:border-l-2 lg:border-t-0 [&>li:last-child>a]:border-b-0">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/\s+/g, "")}`} className={CONTACT_ROW}>
                    <Phone aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="t-field block">Téléphone</span>
                      <span className="t-num font-display text-xl font-bold text-ink">{p}</span>
                    </span>
                  </a>
                </li>
              ))}
              {whatsappDigits ? (
                <li>
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CONTACT_ROW}
                  >
                    <MessageCircle aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="t-field block">WhatsApp</span>
                      <span className="t-num font-display text-xl font-bold text-ink">{contact.whatsapp}</span>
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <a href={`mailto:${contact.email}`} className={CONTACT_ROW}>
                  <Mail aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="min-w-0">
                    <span className="t-field block">E-mail</span>
                    <span className="break-all font-display text-xl font-bold text-ink">{contact.email}</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Le coupon final ───────── */}
      <section
        aria-labelledby="about-cta-title"
        className="bg-enamel pb-20 lg:pb-28"
      >
        <div className="wrap">
          <div className="coupon grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="p-6 sm:p-10 lg:p-12">
              <h2
                id="about-cta-title"
                className="t-h2 max-w-[28ch] text-balance text-ink"
              >
                Parlons de votre projet de transformation digitale
              </h2>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
                Diagnostic gratuit, échange sans engagement avec un consultant
                senior. Réponse sous 24 à 48 heures ouvrées.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 sm:p-8 lg:border-l-2 lg:border-t-0">
              <p className="t-field !text-carbon">Coupon détachable</p>
              <CTAButton
                intent="contact"
                label="Nous contacter"
                block="final-cta"
                size="lg"
                className="w-full"
              />
              <CTAButton
                intent="diagnostic"
                label="Demander un diagnostic"
                block="final-cta"
                size="md"
                variant="secondary"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
