import type { Metadata } from "next";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { JsonLd } from "@/components/shared/JsonLd";
import { ManageCookiesButton } from "@/components/shared/ManageCookiesButton";
import { RouteBand } from "@/components/about/RouteBand";
import { getSiteSettings } from "@/lib/content";
import { getLine } from "@/lib/network";
import { buildMetadata } from "@/lib/seo";
import { Toc, type TocItem } from "./Toc";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";

const LAST_UPDATED = "2026-10-23";
const LAST_UPDATED_LABEL = "23 octobre 2026";

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

const SECTIONS: TocItem[] = [
  { id: "responsable-de-traitement", title: "1. Responsable de traitement" },
  { id: "donnees-collectees", title: "2. Données collectées" },
  { id: "finalites-bases-legales", title: "3. Finalités et bases légales" },
  { id: "durees-de-conservation", title: "4. Durées de conservation" },
  {
    id: "destinataires-sous-traitants",
    title: "5. Destinataires et sous-traitants",
  },
  {
    id: "transferts-hors-ue",
    title: "6. Transferts hors Union européenne",
  },
  { id: "cookies-traceurs", title: "7. Cookies et traceurs" },
  { id: "assistant-ia", title: "8. Assistant IA et prise de rendez-vous" },
  { id: "securite", title: "9. Sécurité" },
  { id: "vos-droits", title: "10. Vos droits" },
  {
    id: "modifications",
    title: "11. Modifications de la présente politique",
  },
  { id: "nous-contacter", title: "12. Nous contacter" },
];

const P = "mt-4";
const UL = "mt-4 list-disc space-y-2 pl-6 marker:text-ink-mute";
const A =
  "font-semibold text-ink underline decoration-ink/40 underline-offset-4 transition-colors hover:decoration-ink hover:decoration-2";

function title(id: string): string {
  return SECTIONS.find((s) => s.id === id)?.title ?? "";
}

function H2({ id }: { id: string }) {
  return (
    <div className="group relative">
      <h2
        id={id}
        className="font-display text-[1.625rem] font-bold leading-tight tracking-tight text-ink [text-wrap:balance] sm:text-3xl"
      >
        {title(id)}
      </h2>
      <a
        href={`#${id}`}
        aria-label={`Lien direct vers la section : ${title(id)}`}
        className="absolute -left-9 top-1 hidden size-7 place-items-center rounded-full text-ink-mute opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 xl:grid"
      >
        <Link2 aria-hidden className="size-4" strokeWidth={2} />
      </a>
    </div>
  );
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
              <li className="font-semibold text-ink">
                Politique de confidentialité
              </li>
            </ol>
          </nav>

          <h1 className="t-display mt-8 max-w-[16ch] text-ink lg:mt-12">
            Politique de confidentialité
          </h1>
          <p className="t-lead mt-6">
            La présente politique décrit la manière dont {brand.name} collecte,
            utilise et protège vos données personnelles lorsque vous visitez
            notre site, échangez avec nos équipes ou utilisez nos services.
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
        <div className="wrap grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <Toc items={SECTIONS} />

          <div className="min-w-0 max-w-[68ch] space-y-14 text-[1.0625rem] leading-[1.75] text-ink-soft lg:space-y-16">
            <article aria-labelledby="responsable-de-traitement">
              <H2 id="responsable-de-traitement" />
              <p className={P}>
                Le responsable de traitement des données collectées via ce site
                est&nbsp;:
              </p>
              <ul className="mt-4 space-y-1.5">
                <li>
                  <strong className="text-ink">{brand.name}</strong>
                  {brand.alternateName ? ` (${brand.alternateName})` : ""}
                </li>
                <li>{contact.address.street}</li>
                <li>
                  Email&nbsp;:{" "}
                  <a href={`mailto:${contact.email}`} className={A}>
                    {contact.email}
                  </a>
                </li>
                {contact.phones.map((phone) => (
                  <li key={phone}>
                    Téléphone&nbsp;:{" "}
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className={A}
                    >
                      {phone}
                    </a>
                  </li>
                ))}
              </ul>
            </article>

            <article aria-labelledby="donnees-collectees">
              <H2 id="donnees-collectees" />
              <p className={P}>
                Nous collectons uniquement les données strictement nécessaires
                aux finalités décrites ci-dessous&nbsp;:
              </p>
              <ul className={UL}>
                <li>
                  <strong className="text-ink">Données de contact</strong>
                  &nbsp;: nom, prénom, email, téléphone, organisation et
                  message, transmis volontairement via nos formulaires
                  (contact, demande de démonstration, demande de diagnostic,
                  inscription à une formation).
                </li>
                <li>
                  <strong className="text-ink">Données de navigation</strong>
                  &nbsp;: pages consultées, pages de provenance, pays, région
                  et ville approximatifs, type d&apos;appareil, de navigateur
                  et d&apos;écran, collectées via notre outil de mesure
                  d&apos;audience Umami (sans cookie, votre adresse IP
                  n&apos;est pas conservée) et, si vous l&apos;acceptez,
                  via Google Analytics 4 (section 7).
                </li>
                <li>
                  <strong className="text-ink">Échanges avec l&apos;assistant IA</strong>
                  &nbsp;: les messages que vous lui écrivez et, si vous les
                  lui confiez, les informations de contact du formulaire
                  (voir la section 8).
                </li>
                <li>
                  <strong className="text-ink">Données techniques</strong>
                  &nbsp;: journaux serveurs et identifiants techniques,
                  conservés à des fins de sécurité et de lutte contre la
                  fraude.
                </li>
              </ul>
            </article>

            <article aria-labelledby="finalites-bases-legales">
              <H2 id="finalites-bases-legales" />
              <p className={P}>
                Vos données sont traitées pour les finalités suivantes&nbsp;:
              </p>
              <ul className={UL}>
                <li>
                  Répondre à vos demandes (contact, démonstration, diagnostic,
                  devis) — base légale&nbsp;: mesures précontractuelles à votre
                  demande.
                </li>
                <li>
                  Gérer la relation contractuelle et fournir nos services —
                  base légale&nbsp;: exécution du contrat.
                </li>
                <li>
                  Vous adresser, le cas échéant, des informations sur nos
                  solutions et formations — base légale&nbsp;: intérêt
                  légitime ou consentement.
                </li>
                <li>
                  Mesurer l&apos;audience du site et améliorer son contenu —
                  base légale&nbsp;: intérêt légitime pour Umami (sans
                  cookie) ; consentement pour Google Analytics, que vous
                  pouvez retirer à tout moment.
                </li>
                <li>
                  Respecter nos obligations légales, fiscales et comptables —
                  base légale&nbsp;: obligation légale.
                </li>
              </ul>
            </article>

            <article aria-labelledby="durees-de-conservation">
              <H2 id="durees-de-conservation" />
              <ul className={UL}>
                <li>
                  Demandes via formulaire&nbsp;: 3 ans à compter du dernier
                  contact.
                </li>
                <li>
                  Données clients (contrats, facturation)&nbsp;: 10 ans pour
                  répondre à nos obligations comptables et fiscales.
                </li>
                <li>
                  Données de navigation et mesure d&apos;audience (Umami)&nbsp;:
                  13 mois maximum.
                </li>
                <li>
                  Cookies de mesure d&apos;audience (Google Analytics)&nbsp;:
                  13 mois au plus. Votre choix sur les cookies&nbsp;: 6 mois.
                </li>
                <li>
                  Journaux techniques&nbsp;: 6 à 12 mois selon les obligations
                  applicables.
                </li>
              </ul>
            </article>

            <article aria-labelledby="destinataires-sous-traitants">
              <H2 id="destinataires-sous-traitants" />
              <p className={P}>
                Vos données ne sont jamais vendues. Elles sont accessibles aux
                collaborateurs habilités de {brand.name} et, le cas échéant, à
                des sous-traitants agissant sur nos instructions&nbsp;:
                hébergeur applicatif, prestataire d&apos;emailing, fournisseur
                de mesure d&apos;audience et outils de support client.
              </p>
              <p className={P}>
                Chaque sous-traitant est lié à nous par un contrat encadrant la
                sécurité et la confidentialité des données.
              </p>
            </article>

            <article aria-labelledby="transferts-hors-ue">
              <H2 id="transferts-hors-ue" />
              <p className={P}>
                Lorsque certains outils impliquent un transfert de données hors
                de l&apos;Union européenne ou hors de la zone d&apos;hébergement
                africaine, nous nous assurons que ces transferts sont encadrés
                par des garanties appropriées (clauses contractuelles types,
                décisions d&apos;adéquation, mesures techniques
                complémentaires). C&apos;est notamment le cas de notre
                assistant IA (voir la section 8), dont les prestataires
                peuvent être établis hors de l&apos;Union européenne. Il en va
                de même, si vous l&apos;acceptez, pour Google Analytics
                (Google Ireland Limited), dont les données peuvent être
                transférées vers les États-Unis ou d&apos;autres pays (voir la
                section 7).
              </p>
            </article>

            <article aria-labelledby="cookies-traceurs">
              <H2 id="cookies-traceurs" />
              <p className={P}>
                Notre site utilise des cookies et traceurs strictement
                nécessaires à son fonctionnement, qui ne demandent pas votre
                accord, et, avec votre seul accord, un outil de mesure
                d&apos;audience qui dépose des cookies. S&apos;y ajoutent les
                cookies de Calendly, déposés seulement si vous ouvrez la
                réservation de rendez-vous (voir la section 8).
              </p>
              <ul className={UL}>
                <li>
                  <strong className="text-ink">Votre choix sur les cookies</strong>
                  &nbsp;: pour mémoriser que vous avez accepté ou refusé, nous
                  enregistrons dans votre navigateur un traceur nommé
                  «&nbsp;ac_consent&nbsp;» (stockage local). Il est strictement
                  nécessaire, ne sert qu&apos;à cela, n&apos;est pas transmis à
                  un tiers et est conservé 6 mois, après quoi nous vous
                  reposons la question.
                </li>
                <li>
                  <strong className="text-ink">Umami (sans cookie)</strong>
                  &nbsp;: la fréquentation du site est mesurée avec Umami, un
                  outil libre que nous hébergeons nous-mêmes, sans cookie et
                  sans conserver votre adresse IP. Il enregistre les pages
                  consultées, la page d&apos;origine, le pays, la région et la
                  ville approximatifs, ainsi que le type d&apos;appareil, de
                  navigateur et d&apos;écran.
                </li>
                <li>
                  <strong className="text-ink">Google Analytics 4 (avec votre accord)</strong>
                  &nbsp;: service de mesure d&apos;audience de Google Ireland
                  Limited, qui peut transférer des données hors de l&apos;Union
                  européenne (section 6). Il n&apos;est chargé qu&apos;après
                  que vous avez cliqué sur «&nbsp;Accepter&nbsp;»&nbsp;: tant
                  que vous n&apos;avez pas choisi, ou si vous refusez, aucune
                  balise Google n&apos;est chargée et aucun cookie Google n&apos;est
                  déposé. Il dépose les cookies <code>_ga</code> et{" "}
                  <code>_ga_&lt;identifiant&gt;</code>, d&apos;une durée de 13
                  mois au plus, pour la seule finalité de mesure d&apos;audience
                  (pages consultées, provenance, appareil). Nous avons
                  désactivé les fonctions publicitaires de Google Analytics.
                </li>
              </ul>
              <p className={P}>
                <strong className="text-ink">Modifier ou retirer votre accord</strong>
                &nbsp;: à tout moment, via le lien «&nbsp;Gérer mes cookies&nbsp;»
                en bas de chaque page, ou ici&nbsp;:{" "}
                <ManageCookiesButton className={A} />. Retirer votre accord
                supprime les cookies <code>_ga</code> du site et empêche tout
                nouveau chargement de la balise Google. Refuser est aussi simple
                qu&apos;accepter, et le refus n&apos;affecte pas l&apos;accès aux
                contenus du site.
              </p>
              <p className={P}>
                Vous pouvez aussi configurer votre navigateur pour bloquer ou
                supprimer les cookies.
              </p>
            </article>

            <article aria-labelledby="assistant-ia">
              <H2 id="assistant-ia" />
              <p className={P}>
                Notre assistant IA répond à vos questions sur nos solutions et
                peut vous proposer de laisser vos coordonnées, puis de réserver
                une démonstration. C&apos;est un programme automatisé, pas une
                personne.
              </p>
              <ul className={UL}>
                <li>
                  <strong className="text-ink">Ce qu&apos;il utilise</strong>
                  &nbsp;: les messages que vous lui écrivez, la page d&apos;où
                  vous l&apos;ouvrez et un aperçu de votre parcours (rubriques
                  consultées, durée de lecture approximative). Ce parcours est
                  conservé dans votre navigateur (stockage de session, effacé à
                  la fermeture de l&apos;onglet) et n&apos;est transmis
                  qu&apos;au moment où vous écrivez à l&apos;assistant. Il ne
                  sert pas à la mesure d&apos;audience.
                </li>
                <li>
                  <strong className="text-ink">Qui traite vos messages</strong>
                  &nbsp;: pour rédiger ses réponses, vos messages sont transmis
                  à OpenRouter (États-Unis), passerelle d&apos;accès aux
                  modèles d&apos;intelligence artificielle, qui les achemine
                  vers un hébergeur du modèle DeepSeek. Nous demandons à
                  OpenRouter de ne retenir que des hébergeurs déclarant ne
                  pas conserver ni réutiliser les messages. Ne saisissez pas
                  de données sensibles (santé, mots de passe, numéros de
                  carte ou de pièce d&apos;identité).
                </li>
                <li>
                  <strong className="text-ink">Ce que nous conservons</strong>
                  &nbsp;: nous ne gardons pas l&apos;historique de la
                  conversation. Si vous remplissez le formulaire de
                  coordonnées, vos informations, un résumé de l&apos;échange
                  et les pages consultées sont enregistrés comme toute demande
                  de contact (durée : section 4). Le formulaire comporte une
                  case de consentement, jamais pré-cochée.
                </li>
                <li>
                  <strong className="text-ink">Réservation</strong>
                  &nbsp;: la prise de rendez-vous est assurée par Calendly,
                  service tiers, chargé uniquement lorsque vous cliquez sur
                  « Choisir un créneau ». Calendly peut déposer ses propres
                  cookies et vous demande votre choix à l&apos;ouverture ; sa
                  politique de confidentialité s&apos;applique alors.
                </li>
                <li>
                  <strong className="text-ink">Limites</strong>
                  &nbsp;: les réponses de l&apos;assistant sont informatives et
                  peuvent comporter des erreurs. Caractéristiques, tarifs et
                  délais sont confirmés par un consultant.
                </li>
              </ul>
            </article>

            <article aria-labelledby="securite">
              <H2 id="securite" />
              <p className={P}>
                Nous mettons en œuvre les mesures techniques et
                organisationnelles appropriées pour protéger vos données contre
                tout accès, divulgation, modification ou destruction non
                autorisés&nbsp;: chiffrement des échanges (HTTPS), contrôle des
                accès, journalisation, sauvegardes régulières et revues de
                sécurité.
              </p>
            </article>

            <article aria-labelledby="vos-droits">
              <H2 id="vos-droits" />
              <p className={P}>
                Conformément au Règlement général sur la protection des données
                (RGPD) et aux législations locales applicables, vous disposez
                des droits suivants sur vos données&nbsp;:
              </p>
              <ul className={UL}>
                <li>Droit d&apos;accès et de copie de vos données.</li>
                <li>Droit de rectification des données inexactes.</li>
                <li>Droit à l&apos;effacement (« droit à l&apos;oubli »).</li>
                <li>Droit à la limitation du traitement.</li>
                <li>Droit à la portabilité de vos données.</li>
                <li>
                  Droit d&apos;opposition au traitement, notamment à des fins
                  de prospection.
                </li>
                <li>
                  Droit de retirer votre consentement à tout moment, lorsque
                  le traitement repose sur cette base.
                </li>
                <li>
                  Droit de définir des directives relatives au sort de vos
                  données après votre décès.
                </li>
              </ul>
              <p className={P}>
                Pour exercer vos droits, écrivez-nous à{" "}
                <a href={`mailto:${contact.email}`} className={A}>
                  {contact.email}
                </a>{" "}
                en précisant votre demande. Nous vous répondrons dans un délai
                maximum d&apos;un mois.
              </p>
              <p className={P}>
                Si vous estimez, après nous avoir contactés, que vos droits ne
                sont pas respectés, vous pouvez introduire une réclamation
                auprès de l&apos;autorité de protection des données
                compétente.
              </p>
            </article>

            <article aria-labelledby="modifications">
              <H2 id="modifications" />
              <p className={P}>
                Nous sommes susceptibles de mettre à jour la présente politique
                pour refléter l&apos;évolution de nos services, des
                technologies ou de la réglementation. La date de dernière mise
                à jour indiquée en tête de page fait foi.
              </p>
            </article>

            <article aria-labelledby="nous-contacter">
              <H2 id="nous-contacter" />
              <p className={P}>
                Pour toute question relative à la présente politique ou au
                traitement de vos données personnelles, contactez-nous à{" "}
                <a href={`mailto:${contact.email}`} className={A}>
                  {contact.email}
                </a>{" "}
                ou via notre{" "}
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
