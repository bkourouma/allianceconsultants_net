import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { Perforation } from "@/components/about/CouponKit";
import { PillLink } from "@/components/about/PillLink";
import { PressedStamp } from "@/components/about/PressedStamp";

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
    <section className="bg-enamel">
      <div className="wrap pb-20 pt-10 lg:pb-28 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16">
          <div>
            <h1 className="t-display max-w-[16ch] text-ink">
              Merci, votre demande a bien été reçue
            </h1>
            <p className="t-lead mt-6">
              Notre équipe commerciale revient vers vous sous
              24&nbsp;à&nbsp;48&nbsp;heures ouvrées pour échanger sur votre
              besoin et organiser une démonstration.
            </p>

            {mailKo ? (
              <div
                role="note"
                className="mt-6 flex max-w-[60ch] gap-3 rounded-[3px] border-2 border-ink bg-panel p-4 text-sm text-ink"
              >
                <TriangleAlert
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-ink"
                  strokeWidth={1.75}
                />
                <p>
                  Votre demande a bien été enregistrée. Si vous ne recevez pas
                  d&apos;accusé par e-mail, notre équipe vous recontactera
                  directement.
                </p>
              </div>
            ) : null}

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <PillLink href="/solutions" size="lg">
                Voir toutes nos solutions
              </PillLink>
              <PillLink href="/" size="lg" variant="secondary">
                Retour à l&apos;accueil
              </PillLink>
            </div>
          </div>

          {/* Le récépissé, tamponné une fois */}
          <div className="coupon overflow-hidden">
            <div className="bg-ink px-5 py-2.5 sm:px-7">
              <p className="t-field !text-white">Récépissé de votre demande</p>
            </div>

            <div className="grid min-h-40 place-items-center px-5 py-8 sm:px-7">
              <PressedStamp
                size="clamp(1.75rem, 1.1rem + 2.4vw, 2.75rem)"
                rotate={-5}
              >
                Demande reçue
              </PressedStamp>
            </div>

            <Perforation />

            <div className="grid gap-5 bg-[#f6f5fb] px-5 py-6 sm:px-7">
              {reference ? (
                <div>
                  <p className="t-field">Référence de votre demande&nbsp;:</p>
                  <p className="mt-1.5 break-all font-mono text-xl font-semibold text-ink">
                    {reference}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="t-field">Réponse</p>
                <p className="mt-1.5 font-display text-xl font-bold leading-tight text-ink">
                  Sous 24&nbsp;à&nbsp;48&nbsp;heures ouvrées
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
