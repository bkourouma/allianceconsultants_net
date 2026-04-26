import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Demande envoyée — Alliance Consultants",
  description:
    "Votre demande a bien été reçue. Notre équipe revient vers vous très rapidement.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ ref?: string; mail?: string }>;
}

export default async function ContactRecuPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = params.ref;
  const mailKo = params.mail === "ko";

  return (
    <Section bg="white">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Merci, votre demande a bien été reçue
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          Notre équipe commerciale revient vers vous sous 24&nbsp;à&nbsp;48&nbsp;heures
          ouvrées pour échanger sur votre besoin et organiser une démonstration.
        </p>
        {reference && (
          <p className="mb-2 text-sm text-gray-500">
            Référence de votre demande&nbsp;: <code className="rounded bg-gray-100 px-2 py-1 font-mono">{reference}</code>
          </p>
        )}
        {mailKo && (
          <p className="mb-6 text-sm text-amber-700">
            Votre demande a bien été enregistrée. Si vous ne recevez pas d&apos;accusé
            par e-mail, notre équipe vous recontactera directement.
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary)] px-6 py-3 text-base font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/solutions"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            Voir toutes nos solutions
          </Link>
        </div>
      </div>
    </Section>
  );
}
