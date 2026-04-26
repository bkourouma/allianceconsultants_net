import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Erreur — Alliance Consultants",
  description: "Une erreur est survenue lors de l'envoi de votre demande.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

const REASON_MESSAGES: Record<string, string> = {
  validation:
    "Certaines informations du formulaire sont manquantes ou incorrectes. Merci de vérifier les champs obligatoires (nom, e-mail, téléphone, organisation, message, consentement).",
  rate_limited:
    "Vous avez soumis plusieurs demandes en peu de temps. Merci de patienter quelques minutes avant de réessayer.",
  server:
    "Une erreur technique est survenue de notre côté. Notre équipe a été notifiée. Merci de réessayer dans quelques instants.",
};

export default async function ContactErreurPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason ?? "";
  const message =
    REASON_MESSAGES[reason] ??
    "Une erreur est survenue lors de l'envoi de votre demande. Merci de réessayer.";

  return (
    <Section bg="white">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Nous n&apos;avons pas pu enregistrer votre demande
        </h1>
        <p className="mb-6 text-lg text-gray-600">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/solutions"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            Retour aux solutions
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary)] px-6 py-3 text-base font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </Section>
  );
}
