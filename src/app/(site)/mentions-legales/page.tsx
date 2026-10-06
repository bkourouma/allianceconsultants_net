import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/shared/JsonLd";
import { RouteBand } from "@/components/about/RouteBand";
import { getSiteSettings } from "@/lib/content";
import {
  LEGAL_NOTICE_LAST_UPDATED,
  LEGAL_NOTICE_LAST_UPDATED_LABEL,
} from "@/lib/legal";
import { getLine } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title: "Mentions légales — Alliance Consultants",
      description:
        "Mentions légales du site allianceconsultants.net : éditeur, hébergement, propriété intellectuelle, responsabilité et protection des données personnelles.",
      siteUrl: `${SITE_URL}/mentions-legales`,
    }),
  };
}

const P = "mt-4";
const A =
  "font-semibold text-ink underline decoration-ink/40 underline-offset-4 transition-colors hover:decoration-ink hover:decoration-2";
const H2 =
  "font-display text-[1.625rem] font-bold leading-tight tracking-tight text-ink [text-wrap:balance] sm:text-3xl";

export default async function MentionsLegalesPage() {
  const { brand, contact, legal } = await getSiteSettings();

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
            Informations légales relatives au site allianceconsultants.net et à
            son éditeur, {brand.name}.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Dernière mise à jour&nbsp;:{" "}
            <time dateTime={LEGAL_NOTICE_LAST_UPDATED}>
              {LEGAL_NOTICE_LAST_UPDATED_LABEL}
            </time>
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
          <div className="max-w-[68ch] space-y-14 text-[1.0625rem] leading-[1.75] text-ink-soft lg:space-y-16">
            <article aria-labelledby="editeur">
              <h2 id="editeur" className={H2}>
                Éditeur du site
              </h2>
              <ul className="mt-4 space-y-1.5">
                <li>
                  <strong className="text-ink">{brand.name}</strong>
                  {brand.alternateName ? ` (${brand.alternateName})` : ""}
                </li>
                {legal?.legalForm ? <li>Forme juridique&nbsp;: {legal.legalForm}</li> : null}
                {legal?.shareCapital ? (
                  <li>Capital social&nbsp;: {legal.shareCapital}</li>
                ) : null}
                {legal?.registration ? (
                  <li>Immatriculation&nbsp;: {legal.registration}</li>
                ) : null}
                <li>Activité depuis&nbsp;: {brand.foundingYear}</li>
                <li>
                  Adresse&nbsp;: {contact.address.street} ({contact.address.country})
                </li>
                <li>
                  Email&nbsp;:{" "}
                  <a href={`mailto:${contact.email}`} className={A}>
                    {contact.email}
                  </a>
                </li>
                {contact.phones.map((phone) => (
                  <li key={phone}>
                    Téléphone&nbsp;:{" "}
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className={A}>
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </article>

            {legal?.publicationDirector ? (
              <article aria-labelledby="publication">
                <h2 id="publication" className={H2}>
                  Directeur de la publication
                </h2>
                <p className={P}>{legal.publicationDirector}</p>
              </article>
            ) : null}

            {legal?.host ? (
              <article aria-labelledby="hebergement">
                <h2 id="hebergement" className={H2}>
                  Hébergement
                </h2>
                <ul className="mt-4 space-y-1.5">
                  <li>
                    <strong className="text-ink">{legal.host.name}</strong>
                  </li>
                  {legal.host.address ? <li>{legal.host.address}</li> : null}
                  {legal.host.url ? (
                    <li>
                      <a
                        href={legal.host.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={A}
                      >
                        {legal.host.url}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </article>
            ) : null}

            <article aria-labelledby="propriete-intellectuelle">
              <h2 id="propriete-intellectuelle" className={H2}>
                Propriété intellectuelle
              </h2>
              <p className={P}>
                L&apos;ensemble des contenus du site (textes, logos, marques,
                illustrations, interfaces, logiciels présentés) est la
                propriété de {brand.name} ou de ses partenaires, et protégé
                par le droit de la propriété intellectuelle. Toute
                reproduction, représentation ou adaptation, totale ou
                partielle, sans autorisation écrite préalable est interdite.
              </p>
              <p className={P}>
                Les noms de solutions, de clients et de partenaires cités
                restent la propriété de leurs titulaires respectifs.
              </p>
            </article>

            <article aria-labelledby="responsabilite">
              <h2 id="responsabilite" className={H2}>
                Responsabilité
              </h2>
              <p className={P}>
                Les informations publiées sur ce site sont fournies à titre
                indicatif et peuvent évoluer. Les caractéristiques, tarifs et
                délais de nos solutions et services sont confirmés par un
                consultant avant tout engagement. Les réponses de
                l&apos;assistant IA sont informatives et peuvent comporter des
                erreurs.
              </p>
              <p className={P}>
                Le site peut contenir des liens vers des sites tiers (dont les
                sites de nos solutions hébergés sur d&apos;autres domaines).
                {" "}{brand.name} n&apos;exerce aucun contrôle sur leur contenu
                et décline toute responsabilité à ce titre.
              </p>
            </article>

            <article aria-labelledby="donnees-personnelles">
              <h2 id="donnees-personnelles" className={H2}>
                Données personnelles et cookies
              </h2>
              <p className={P}>
                Le traitement de vos données personnelles, la mesure
                d&apos;audience, les droits dont vous disposez et la manière de
                les exercer sont décrits dans notre{" "}
                <Link href="/privacy" className={A}>
                  politique de confidentialité
                </Link>
                .
              </p>
            </article>

            <article aria-labelledby="contact">
              <h2 id="contact" className={H2}>
                Nous contacter
              </h2>
              <p className={P}>
                Pour toute question relative au site ou à ces mentions, écrivez
                à{" "}
                <a href={`mailto:${contact.email}`} className={A}>
                  {contact.email}
                </a>{" "}
                ou utilisez notre{" "}
                <Link href="/contact-demo" className={A}>
                  page de contact
                </Link>
                .
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
