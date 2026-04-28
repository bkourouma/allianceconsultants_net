import type { Metadata } from "next";
import Link from "next/link";

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
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 100% 0%, rgba(244,63,94,0.18), transparent 70%), radial-gradient(50% 50% at 0% 100%, rgba(245,158,11,0.18), transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/70 bg-white/85 p-8 text-center shadow-xl backdrop-blur-sm sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Nous n&apos;avons pas pu enregistrer votre demande
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            {message}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/solutions"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Retour aux solutions
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-primary px-6 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
