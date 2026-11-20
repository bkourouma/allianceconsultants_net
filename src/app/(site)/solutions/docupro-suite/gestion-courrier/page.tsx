import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTAButton } from "@/components/shared/CTAButton";
import { Breadcrumb } from "@/components/solutions/Breadcrumb";
import { Faq } from "@/components/solutions/Faq";
import { getLine, lineStyle } from "@/lib/network";
import { buildFaqJsonLd, buildMetadata } from "@/lib/seo";
import type { FaqEntry } from "@/lib/validators/content";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allianceconsultants.net";
const PAGE_URL = `${SITE_URL}/solutions/docupro-suite/gestion-courrier`;

export const metadata: Metadata = {
  ...buildMetadata({
    title:
      "Gestion électronique du courrier : logiciel pour administrations et entreprises",
    description:
      "Logiciel de gestion du courrier administratif : enregistrement, imputation, suivi des accusés de réception et traçabilité avec le module Docu-Courriers de DocuPro Suite.",
    ogImage: "/images/solutions/docupro-suite.svg",
    siteUrl: PAGE_URL,
  }),
  alternates: { canonical: PAGE_URL },
};

const FAQ: FaqEntry[] = [
  {
    question: "Qu'est-ce qu'un logiciel de gestion électronique du courrier ?",
    answer:
      "C'est un outil qui enregistre les courriers dès leur réception, les attribue aux services concernés et conserve la trace de chaque étape de traitement. Dans DocuPro Suite, cette fonction est assurée par le module Docu-Courriers.",
  },
  {
    question: "Le logiciel gère-t-il le courrier entrant et le courrier sortant ?",
    answer:
      "Oui. Docu-Courriers permet d'enregistrer, de qualifier et d'orienter les courriers physiques et numériques, entrants comme sortants, dès la réception.",
  },
  {
    question: "Comment suit-on le traitement d'un courrier ?",
    answer:
      "Le courrier est imputé au service compétent, les destinataires sont notifiés automatiquement, et les délais de prise en charge comme les statuts de traitement se suivent de bout en bout, avec les accusés de réception.",
  },
  {
    question: "Peut-on combiner la gestion du courrier avec l'archivage ?",
    answer:
      "Oui. DocuPro Suite réunit dans une même plateforme les modules Docu-Courriers, Docu-Archives, Docu-GED et Docu-Flow : le courrier traité peut rejoindre le même environnement que vos archives et vos workflows.",
  },
  {
    question: "DocuPro Suite est-il déployable en SaaS ou sur nos serveurs ?",
    answer:
      "DocuPro Suite peut être déployée en mode SaaS opéré par Alliance Consultants, sur votre cloud privé ou sur vos serveurs internes selon vos contraintes de souveraineté et de sécurité.",
  },
];

const SECTIONS = [
  {
    id: "courrier-papier",
    title: "Les problèmes du courrier papier",
    intro:
      "Quand le courrier circule sur papier ou par e-mail, le suivi devient fragile :",
    points: [
      "des courriers entrants et sortants peu suivis, sans imputation claire ni traçabilité des accusés de réception ;",
      "des procédures d'approbation lentes, dépendantes de circuits papier ou e-mail non auditables ;",
      "un manque de visibilité sur le statut des dossiers en cours et sur les délais de traitement.",
    ],
  },
  {
    id: "entrant-sortant",
    title: "Courrier entrant et sortant",
    intro:
      "Le module Docu-Courriers de DocuPro Suite prend en charge le courrier dès sa réception :",
    points: [
      "enregistrement et qualification des courriers physiques et numériques ;",
      "orientation et imputation aux services concernés ;",
      "notification automatique des destinataires.",
    ],
  },
  {
    id: "validation-suivi",
    title: "Circuit de validation et suivi",
    intro:
      "Avec Docu-Flow, vous modélisez vos circuits d'approbation et de validation sans développement, et vous suivez chaque dossier :",
    points: [
      "état d'avancement et étapes restantes visibles en temps réel ;",
      "délais de prise en charge et statuts de traitement suivis de bout en bout ;",
      "suivi des accusés de réception.",
    ],
  },
  {
    id: "archivage-tracabilite",
    title: "Archivage et traçabilité",
    intro:
      "Le courrier traité s'inscrit dans la même plateforme que vos archives :",
    points: [
      "toutes les actions sensibles sont journalisées et associées à un utilisateur identifié ;",
      "durées d'utilité administrative et sorts finaux pilotés avec Docu-Archives ;",
      "documents, versions et workflows traçables, ce qui facilite les contrôles internes et les audits.",
    ],
  },
];

export default function GestionCourrierPage() {
  const line = getLine("docupro-suite");
  return (
    <div
      className={line ? `line-${line.id}` : undefined}
      style={lineStyle("docupro-suite")}
    >
      <JsonLd data={buildFaqJsonLd(FAQ)} />

      <header className="wrap pb-10 pt-8 lg:pb-14">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Solutions", href: "/solutions" },
            { label: "DocuPro Suite", href: "/solutions/docupro-suite" },
            { label: "Gestion du courrier" },
          ]}
        />
        <h1 className="t-h1 mt-6 text-ink">
          Gestion du courrier administratif : du courrier entrant à
          l&apos;archivage
        </h1>
        <p className="t-lead mt-5 !max-w-[62ch] text-ink-soft">
          DocuPro Suite, la plateforme GED d&apos;Alliance Consultants, réunit
          le suivi des courriers, les workflows de validation et l&apos;archivage
          pour les administrations et les entreprises.
        </p>
      </header>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="pb-12 lg:pb-16"
        >
          <div className="wrap">
            <h2 id={`${section.id}-title`} className="t-h2 text-ink">
              {section.title}
            </h2>
            <p className="t-body mt-4 !max-w-[62ch] text-ink-soft">
              {section.intro}
            </p>
            <ul className="t-body mt-4 list-disc space-y-2 pl-6 text-ink-soft">
              {section.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section
        id="demonstration"
        aria-labelledby="demonstration-title"
        className="pb-12 lg:pb-16"
      >
        <div className="wrap">
          <h2 id="demonstration-title" className="t-h2 text-ink">
            Démonstration DocuPro Suite
          </h2>
          <p className="t-body mt-4 !max-w-[62ch] text-ink-soft">
            Voyez le circuit du courrier sur vos propres cas : réception,
            imputation, suivi et clôture tracée. Découvrez aussi l&apos;ensemble
            de la plateforme sur la{" "}
            <Link href="/solutions/docupro-suite" className="underline">
              page DocuPro Suite
            </Link>
            .
          </p>
          <div className="mt-6">
            <CTAButton
              intent="demo"
              label="Demander une démo DocuPro"
              solutionSlug="docupro-suite"
              block="final-cta"
            />
          </div>
        </div>
      </section>

      <Faq entries={FAQ} />
    </div>
  );
}
