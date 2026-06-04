import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/shared/JsonLd";
import { getSiteSettings } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

const LAST_UPDATED = "2026-06-04";
const LAST_UPDATED_LABEL = "4 juin 2026";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...buildMetadata({
      title:
        "Politique de confidentialité — Alliance Consultants",
      description:
        "Politique de confidentialité d'Alliance Consultants : données collectées, finalités, durées de conservation, droits RGPD, cookies et contact du responsable de traitement.",
      siteUrl: `${SITE_URL}/privacy`,
    }),
    alternates: { canonical: `${SITE_URL}/privacy` },
  };
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const { brand, contact } = settings;

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
        name: "Politique de confidentialité",
        item: `${SITE_URL}/privacy`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

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
              <li className="font-medium text-slate-700">
                Politique de confidentialité
              </li>
            </ol>
          </nav>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Informations légales
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            Politique de confidentialité
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            La présente politique décrit la manière dont {brand.name} collecte,
            utilise et protège vos données personnelles lorsque vous visitez
            notre site, échangez avec nos équipes ou utilisez nos services.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Dernière mise à jour&nbsp;:{" "}
            <time dateTime={LAST_UPDATED}>{LAST_UPDATED_LABEL}</time>
          </p>
        </div>
      </section>

      <Section bg="white" padding="md">
        <div className="mx-auto max-w-3xl space-y-12">
          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              1. Responsable de traitement
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Le responsable de traitement des données collectées via ce site
              est&nbsp;:
            </p>
            <ul className="mt-4 space-y-1.5 text-base leading-relaxed text-slate-700">
              <li>
                <strong>{brand.name}</strong>
                {brand.alternateName ? ` (${brand.alternateName})` : ""}
              </li>
              <li>{contact.address.street}</li>
              <li>
                Email&nbsp;:{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
              </li>
              {contact.phones.map((phone) => (
                <li key={phone}>
                  Téléphone&nbsp;:{" "}
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              2. Données collectées
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Nous collectons uniquement les données strictement nécessaires aux
              finalités décrites ci-dessous&nbsp;:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700">
              <li>
                <strong>Données de contact</strong>&nbsp;: nom, prénom, email,
                téléphone, organisation et message, transmis volontairement via
                nos formulaires (contact, demande de démonstration, demande de
                diagnostic, inscription à une formation).
              </li>
              <li>
                <strong>Données de navigation</strong>&nbsp;: pages consultées,
                pages de provenance, type d&apos;appareil et de navigateur,
                adresse IP tronquée, collectées via nos outils de mesure
                d&apos;audience.
              </li>
              <li>
                <strong>Données techniques</strong>&nbsp;: journaux serveurs et
                identifiants techniques, conservés à des fins de sécurité et de
                lutte contre la fraude.
              </li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              3. Finalités et bases légales
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Vos données sont traitées pour les finalités suivantes&nbsp;:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700">
              <li>
                Répondre à vos demandes (contact, démonstration, diagnostic,
                devis) — base légale&nbsp;: mesures précontractuelles à votre
                demande.
              </li>
              <li>
                Gérer la relation contractuelle et fournir nos services — base
                légale&nbsp;: exécution du contrat.
              </li>
              <li>
                Vous adresser, le cas échéant, des informations sur nos
                solutions et formations — base légale&nbsp;: intérêt légitime
                ou consentement.
              </li>
              <li>
                Mesurer l&apos;audience du site et améliorer son contenu — base
                légale&nbsp;: intérêt légitime ou consentement pour les outils
                non exemptés.
              </li>
              <li>
                Respecter nos obligations légales, fiscales et comptables — base
                légale&nbsp;: obligation légale.
              </li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              4. Durées de conservation
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700">
              <li>
                Demandes via formulaire&nbsp;: 3 ans à compter du dernier
                contact.
              </li>
              <li>
                Données clients (contrats, facturation)&nbsp;: 10 ans pour
                répondre à nos obligations comptables et fiscales.
              </li>
              <li>
                Données de navigation et mesure d&apos;audience&nbsp;: 13 mois
                maximum.
              </li>
              <li>
                Journaux techniques&nbsp;: 6 à 12 mois selon les obligations
                applicables.
              </li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              5. Destinataires et sous-traitants
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Vos données ne sont jamais vendues. Elles sont accessibles aux
              collaborateurs habilités de {brand.name} et, le cas échéant, à
              des sous-traitants agissant sur nos instructions&nbsp;: hébergeur
              applicatif, prestataire d&apos;emailing, fournisseur de mesure
              d&apos;audience et outils de support client.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Chaque sous-traitant est lié à nous par un contrat encadrant la
              sécurité et la confidentialité des données.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              6. Transferts hors Union européenne
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Lorsque certains outils impliquent un transfert de données hors de
              l&apos;Union européenne ou hors de la zone d&apos;hébergement
              africaine, nous nous assurons que ces transferts sont encadrés
              par des garanties appropriées (clauses contractuelles types,
              décisions d&apos;adéquation, mesures techniques complémentaires).
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              7. Cookies et traceurs
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Notre site utilise des cookies strictement nécessaires à son
              fonctionnement, ainsi que, sous réserve de votre consentement,
              des cookies de mesure d&apos;audience pour améliorer
              l&apos;expérience proposée.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Vous pouvez à tout moment configurer votre navigateur pour bloquer
              ou supprimer les cookies. Le refus des cookies non essentiels
              n&apos;affecte pas l&apos;accès aux contenus du site.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              8. Sécurité
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Nous mettons en œuvre les mesures techniques et organisationnelles
              appropriées pour protéger vos données contre tout accès,
              divulgation, modification ou destruction non autorisés&nbsp;:
              chiffrement des échanges (HTTPS), contrôle des accès,
              journalisation, sauvegardes régulières et revues de sécurité.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              9. Vos droits
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Conformément au Règlement général sur la protection des données
              (RGPD) et aux législations locales applicables, vous disposez
              des droits suivants sur vos données&nbsp;:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700">
              <li>Droit d&apos;accès et de copie de vos données.</li>
              <li>Droit de rectification des données inexactes.</li>
              <li>Droit à l&apos;effacement (« droit à l&apos;oubli »).</li>
              <li>Droit à la limitation du traitement.</li>
              <li>Droit à la portabilité de vos données.</li>
              <li>
                Droit d&apos;opposition au traitement, notamment à des fins de
                prospection.
              </li>
              <li>
                Droit de retirer votre consentement à tout moment, lorsque le
                traitement repose sur cette base.
              </li>
              <li>
                Droit de définir des directives relatives au sort de vos
                données après votre décès.
              </li>
            </ul>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Pour exercer vos droits, écrivez-nous à{" "}
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {contact.email}
              </a>{" "}
              en précisant votre demande. Nous vous répondrons dans un délai
              maximum d&apos;un mois.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Si vous estimez, après nous avoir contactés, que vos droits ne
              sont pas respectés, vous pouvez introduire une réclamation auprès
              de l&apos;autorité de protection des données compétente.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              10. Modifications de la présente politique
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Nous sommes susceptibles de mettre à jour la présente politique
              pour refléter l&apos;évolution de nos services, des technologies
              ou de la réglementation. La date de dernière mise à jour
              indiquée en tête de page fait foi.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              11. Nous contacter
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              Pour toute question relative à la présente politique ou au
              traitement de vos données personnelles, contactez-nous à{" "}
              <a
                href={`mailto:${contact.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {contact.email}
              </a>{" "}
              ou via notre{" "}
              <Link
                href="/contact-demo"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                page de contact
              </Link>
              .
            </p>
          </article>
        </div>
      </Section>
    </>
  );
}
