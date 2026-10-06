import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { HistoryLine, type Milestone } from "@/components/about/HistoryLine";
import { RouteBand } from "@/components/about/RouteBand";
import { SectorSelector } from "@/components/about/SectorSelector";
import { TerminusMark } from "@/components/about/TerminusMark";
import { Reveal } from "@/components/fx/Reveal";
import { getSiteSettings } from "@/lib/content";
import { ACADEMIE, LINES, getLine } from "@/lib/network";
import { buildMetadata, buildWebPageJsonLd } from "@/lib/seo";

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

const MILESTONES: Milestone[] = [
  {
    year: "2003",
    title: "Création d'Alliance Consultants",
    description:
      "Fondation à Abidjan autour d'une promesse : apporter aux organisations africaines une expertise technique de niveau international.",
    color: "#0b1b3a",
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
    title: "Pôle dématérialisation & scanners",
    description:
      "Structuration de l'offre numérisation : intégration de scanners professionnels, prestations de dématérialisation et gouvernance documentaire.",
    color: getLine("cliniquepro")?.color ?? "#00789a",
  },
  {
    year: "2020",
    title: "Extension à la santé et à l'immobilier",
    description:
      "Lancement de MedicPro et CliniquePro pour le secteur médical et d'ImmoTopia.cloud pour la gestion immobilière.",
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

const BAND = [
  getLine("docupro")!.color,
  getLine("immotopia")!.color,
  getLine("annonces")!.color,
];

const CONTACT_LINK =
  "group flex min-h-12 items-center gap-4 rounded-lg px-3 py-2 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:bg-enamel";

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

  const aboutPageJsonLd = buildWebPageJsonLd({
    type: "AboutPage",
    name: "À propos d'Alliance Consultants",
    description: settings.brand.tagline,
    url: `${SITE_URL}/a-propos`,
    siteUrl: SITE_URL,
  });

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={aboutPageJsonLd} />

      {/* ───────── Départ : l'histoire ───────── */}
      <section className="bg-enamel pt-8 lg:pt-12">
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

          <h1 className="t-display mt-8 max-w-[18ch] text-ink lg:mt-12">
            Éditeur et intégrateur africain de solutions SaaS, IA et métiers
          </h1>
          <p className="t-lead mt-6">
            Depuis {settings.brand.foundingYear}, Alliance Consultants conçoit,
            édite et opère des plateformes logicielles et des services experts
            pour accompagner les organisations d&apos;Afrique francophone dans
            leur transformation digitale.
          </p>
        </div>
        <RouteBand colors={BAND} className="mt-10 lg:mt-14" />
      </section>

      <section className="bg-panel py-16 lg:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
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

          <Reveal
            delay={120}
            className="relative self-start overflow-hidden rounded-lg bg-night p-7 text-white sm:p-9"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 flex h-1.5"
            >
              {LINES.map((l) => (
                <span
                  key={l.id}
                  className="flex-1"
                  style={{ background: l.color }}
                />
              ))}
            </span>
            <h2 className="t-h3 text-white">
              Un écosystème logiciel africain souverain et de niveau mondial
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/85">
              Nous croyons qu&apos;une transformation digitale durable passe par
              trois piliers indissociables : des produits SaaS robustes conçus
              en Afrique, une montée en compétences continue des équipes, et
              une intégration intelligente de l&apos;IA dans les opérations
              quotidiennes.
            </p>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/85">
              Notre ambition : faire d&apos;Alliance Consultants la maison de
              référence pour l&apos;édition logicielle, les services experts et
              la formation IA en Afrique francophone.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────── La ligne du temps ───────── */}
      <section
        aria-labelledby="history-title"
        className="bg-enamel py-16 lg:py-24"
      >
        <div className="wrap">
          <h2 id="history-title" className="t-h2 max-w-[24ch] text-ink">
            Une trajectoire au service du logiciel africain
          </h2>
          <div className="mt-12 lg:mt-16">
            <HistoryLine milestones={MILESTONES} />
          </div>
        </div>
      </section>

      {/* ───────── L'équipe et les pôles ───────── */}
      <section className="bg-night py-16 text-white lg:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="t-h2 max-w-[18ch] text-white">
              Des praticiens expérimentés, ancrés à Abidjan
            </h2>
            <div className="mt-8 grid gap-5 text-[1.0625rem] leading-relaxed text-white/85">
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
                africains à travers <strong>École Digitale</strong>, notre pôle
                de formation continue dédié à l&apos;IA, au développement et
                aux métiers du numérique.
              </p>
            </div>
          </div>

          <div>
            <h3 className="t-h3 text-white">
              Cinq pôles complémentaires au service de votre transformation
            </h3>
            <p className="mt-3 max-w-[56ch] text-white/75">
              Du diagnostic stratégique à l&apos;exploitation quotidienne, nos
              équipes couvrent l&apos;ensemble de la chaîne de valeur
              logicielle.
            </p>
            <dl className="mt-8 divide-y divide-white/15 border-y border-white/15">
              {EXPERTISE.map((item) => (
                <div
                  key={item.title}
                  className="grid gap-1 py-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="flex items-start gap-3 font-display text-lg font-bold leading-snug text-white">
                    <span
                      aria-hidden
                      className="mt-1.5 size-3.5 shrink-0 rounded-full border-[3px] border-white bg-night"
                    />
                    {item.title}
                  </dt>
                  <dd className="text-[0.9375rem] leading-relaxed text-white/75">
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───────── Les secteurs ───────── */}
      <section
        aria-labelledby="sectors-title"
        className="bg-enamel py-16 lg:py-24"
      >
        <div className="wrap">
          <h2 id="sectors-title" className="t-h2 max-w-[18ch] text-ink">
            Nous travaillons avec…
          </h2>
          <p className="t-lead mt-5">
            Choisissez votre secteur : les lignes du réseau qui vous concernent
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
        className="bg-panel py-16 lg:py-24"
      >
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 id="values-title" className="t-h2 max-w-[16ch] text-ink">
              Quatre principes qui guident nos engagements
            </h2>
          </div>
          <ol className="relative grid gap-10">
            <span
              aria-hidden
              className="absolute bottom-2 left-[0.6875rem] top-2 w-1.5 rounded-full bg-ink"
            />
            {VALUES.map((v) => (
              <li key={v.title} className="relative pl-12">
                <span
                  aria-hidden
                  className="absolute left-0 top-0.5 block size-7 rounded-full border-[5px] bg-panel"
                  style={{ borderColor: v.color }}
                />
                <h3 className="t-h3 text-ink">{v.title}</h3>
                <p className="t-body mt-3 text-[1.0625rem] leading-relaxed text-ink-soft">
                  {v.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Bureaux & contact ───────── */}
      <section
        aria-labelledby="offices-title"
        className="bg-enamel py-16 lg:py-24"
      >
        <div className="wrap">
          <div className="grid overflow-hidden rounded-lg bg-panel ring-1 ring-rule lg:grid-cols-[1fr_1fr]">
            <div className="relative bg-ink p-8 text-white sm:p-10 lg:p-12">
              <MapPin
                aria-hidden
                className="size-7 text-white"
                strokeWidth={1.75}
              />
              <h2
                id="offices-title"
                className="t-h2 mt-6 text-white"
              >
                {settings.contact.address.city}
              </h2>
              <p className="mt-3 text-lg text-white/85">
                {contact.address.street}
              </p>
              <p className="mt-6 max-w-[40ch] text-white/75">
                Basés à <strong>{contact.address.city}</strong>, Côte
                d&apos;Ivoire. Interventions dans toute l&apos;Afrique
                francophone.
              </p>
              <div aria-hidden className="mt-10 flex h-1.5 gap-1.5">
                {LINES.map((l) => (
                  <span
                    key={l.id}
                    className="flex-1 rounded-full"
                    style={{ background: l.color }}
                  />
                ))}
              </div>
            </div>

            <ul className="grid content-center gap-1 p-5 sm:p-8 lg:p-10">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    className={CONTACT_LINK}
                  >
                    <Phone aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="sr-only">Téléphone : </span>
                      {p}
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
                    className={CONTACT_LINK}
                  >
                    <MessageCircle aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="sr-only">WhatsApp : </span>
                      {contact.whatsapp}
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <a href={`mailto:${contact.email}`} className={CONTACT_LINK}>
                  <Mail aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="break-all">
                    <span className="sr-only">E-mail : </span>
                    {contact.email}
                  </span>
                </a>
              </li>
              <li className="flex min-h-12 items-center gap-4 px-3 py-2 text-[0.9375rem] text-ink-soft">
                <Clock aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                <span>
                  Lundi&nbsp;–&nbsp;Vendredi, 8&nbsp;h&nbsp;–&nbsp;18&nbsp;h (GMT)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Terminus ───────── */}
      <section
        aria-labelledby="about-cta-title"
        className="overflow-hidden bg-night text-white"
      >
        <div className="wrap grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div>
            <h2
              id="about-cta-title"
              className="t-h2 max-w-[20ch] text-white"
            >
              Parlons de votre projet de transformation digitale
            </h2>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-white/80">
              Diagnostic gratuit, échange sans engagement avec un consultant
              senior. Réponse sous 24 h ouvrées.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
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
          <TerminusMark
            colors={[BAND[0], BAND[1], BAND[2]]}
            className="mx-auto max-w-sm lg:max-w-none"
          />
        </div>
      </section>
    </>
  );
}
