import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/shared/JsonLd";
import { RouteBand } from "@/components/about/RouteBand";
import { getSiteSettings } from "@/lib/content";
import { getLine } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

const LAST_UPDATED = "2026-10-23";
const LAST_UPDATED_LABEL = "23 octobre 2026";

// Identité légale validée par le propriétaire de la société. L'hébergeur est
// repris du site CliniquePro et reste à confirmer pour ce site.
const LEGAL = {
  legalName: "ALLIANCE COMPUTER CONSULTANTS",
  form: "société à responsabilité limitée (SARL)",
  capital: "3 000 000 FCFA (trois millions de francs CFA)",
  headOffice: "Abidjan Cocody, II Plateaux Sideci Zoo, 18 BP 318",
  manager: "Monsieur Baba KOUROUMA, Associé-Gérant",
  rccm: "CI-ABJ-2014-B-20956",
  taxId: "1438224 S",
  publicationDirector: "Baba KOUROUMA",
  host: "Hostinger International Ltd.",
  hostAddress: "61 Lordou Vironos Street, 6023 Larnaca, Chypre",
  hostSite: "https://www.hostinger.com",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Mentions légales — Alliance Consultants",
      description:
        "Mentions légales d'Alliance Consultants : éditeur du site, hébergeur, propriété intellectuelle et protection des données personnelles.",
      siteUrl: `${SITE_URL}/mentions-legales`,
    }),
    alternates: { canonical: `${SITE_URL}/mentions-legales` },
  };
}

const P = "mt-4";
const UL = "mt-4 list-disc space-y-2 pl-6 marker:text-ink-mute";
const A =
  "font-semibold text-ink underline decoration-ink/40 underline-offset-4 transition-colors hover:decoration-ink hover:decoration-2";
const H2 =
  "font-display text-[1.625rem] font-bold leading-tight tracking-tight text-ink [text-wrap:balance] sm:text-3xl";

export default async function MentionsLegalesPage() {
  const settings = await getSiteSettings();
  const { brand, contact } = settings;
  const domain = SITE_URL.replace("https://", "");

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mentions légales",
        item: `${SITE_URL}/mentions-legales`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

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
              <li className="font-semibold text-ink">Mentions légales</li>
            </ol>
          </nav>

          <h1 className="t-display mt-8 max-w-[16ch] text-ink lg:mt-12">
            Mentions légales
          </h1>
          <p className="t-lead mt-6">
            Les informations ci-dessous identifient l&apos;éditeur et
            l&apos;hébergeur du site {domain}.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Dernière mise à jour&nbsp;:{" "}
            <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
          </p>
        </div>
        <RouteBand
          colors={[
            getLine("docupro")!.color,
            getLine("cliniquepro")!.color,
            getLine("medicpro")!.color,
          ]}
          className="mt-10 lg:mt-14"
        />
      </section>

      <section className="bg-panel py-12 lg:py-20">
        <div className="wrap">
          <div className="min-w-0 max-w-[68ch] space-y-14 text-[1.0625rem] leading-[1.75] text-ink-soft lg:space-y-16">
            <article aria-labelledby="editeur">
              <h2 id="editeur" className={H2}>
                Éditeur du site
              </h2>
              <p className={P}>
                Le site <strong className="text-ink">{domain}</strong> est
                édité sous le nom commercial «&nbsp;{brand.name}&nbsp;» par{" "}
                <strong className="text-ink">{LEGAL.legalName}</strong>,{" "}
                {LEGAL.form} au capital de {LEGAL.capital}, dont le siège est
                situé à {LEGAL.headOffice}, représentée par {LEGAL.manager}.
              </p>
              <ul className={UL}>
                <li>RCCM&nbsp;: {LEGAL.rccm}</li>
                <li>Compte contribuable (CC)&nbsp;: {LEGAL.taxId}</li>
                <li>
                  Directeur de la publication&nbsp;: {LEGAL.publicationDirector}
                </li>
                <li>
                  E-mail&nbsp;:{" "}
                  <a href={`mailto:${contact.email}`} className={A}>
                    {contact.email}
                  </a>
                </li>
              </ul>
            </article>

            <article aria-labelledby="hebergement">
              <h2 id="hebergement" className={H2}>
                Hébergement
              </h2>
              <p className={P}>
                Le site est hébergé par{" "}
                <strong className="text-ink">{LEGAL.host}</strong>,{" "}
                {LEGAL.hostAddress} (
                <a href={LEGAL.hostSite} className={A} rel="noopener noreferrer">
                  {LEGAL.hostSite.replace("https://", "")}
                </a>
                ).
              </p>
            </article>

            <article aria-labelledby="propriete-intellectuelle">
              <h2 id="propriete-intellectuelle" className={H2}>
                Propriété intellectuelle
              </h2>
              <p className={P}>
                L&apos;ensemble des contenus du site (textes, visuels, logo,
                interfaces, code) est la propriété de {brand.name} ou fait
                l&apos;objet d&apos;une autorisation d&apos;utilisation. Toute
                reproduction ou représentation, totale ou partielle, sans
                autorisation écrite préalable est interdite.
              </p>
            </article>

            <article aria-labelledby="donnees-personnelles">
              <h2 id="donnees-personnelles" className={H2}>
                Données personnelles
              </h2>
              <p className={P}>
                Le traitement des données collectées sur ce site est décrit
                dans notre{" "}
                <Link href="/privacy" className={A}>
                  politique de confidentialité
                </Link>
                . Pour toute question, vous pouvez nous écrire à{" "}
                <a href={`mailto:${contact.email}`} className={A}>
                  {contact.email}
                </a>
                .
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
