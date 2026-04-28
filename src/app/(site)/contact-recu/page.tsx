import type { Metadata } from "next";
import Link from "next/link";

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
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 10%, rgba(59,130,246,0.18), transparent 70%), radial-gradient(50% 50% at 20% 100%, rgba(16,185,129,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Merci, votre demande a bien été reçue
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Notre équipe commerciale revient vers vous sous 24&nbsp;à&nbsp;48&nbsp;heures
            ouvrées pour échanger sur votre besoin et organiser une démonstration.
          </p>

          {reference && (
            <p className="mt-6 text-sm text-slate-600">
              Référence de votre demande&nbsp;:{" "}
              <code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-800">
                {reference}
              </code>
            </p>
          )}

          {mailKo && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Votre demande a bien été enregistrée. Si vous ne recevez pas
              d&apos;accusé par e-mail, notre équipe vous recontactera
              directement.
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/solutions"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Voir toutes nos solutions
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
