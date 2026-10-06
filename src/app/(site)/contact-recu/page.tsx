import type { Metadata } from "next";
import { Check, TriangleAlert } from "lucide-react";
import { PillLink } from "@/components/about/PillLink";
import { getLine } from "@/lib/network";
import { Arrival } from "./Arrival";

export const metadata: Metadata = {
  title: { absolute: "Demande envoyée — Alliance Consultants" },
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
    <>
      <section className="bg-enamel">
        <Arrival
          color={getLine("docupro")!.color}
          stripe={getLine("ecole")!.color}
        />

        <div className="wrap pb-16 pt-8 lg:pb-24 lg:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <span className="grid size-14 place-items-center rounded-full bg-ink text-white">
                <Check aria-hidden className="size-7" strokeWidth={2.5} />
              </span>
              <h1 className="t-display mt-6 max-w-[16ch] text-ink">
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
                  className="mt-6 flex max-w-[60ch] gap-3 rounded-lg bg-panel p-4 text-sm text-ink ring-1 ring-rule"
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

            {reference ? (
              <div className="self-start">
                <div className="relative overflow-hidden rounded-lg bg-panel ring-1 ring-rule">
                  <div className="bg-ink px-6 py-4 text-white">
                    <p className="t-station">Arrivée au terminus</p>
                  </div>
                  <div
                    aria-hidden
                    className="relative border-t-2 border-dashed border-rule"
                  >
                    <span className="absolute left-0 top-0 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-enamel" />
                    <span className="absolute right-0 top-0 size-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-enamel" />
                  </div>
                  <div className="px-6 py-6">
                    <p className="text-sm text-ink-soft">
                      Référence de votre demande&nbsp;:
                    </p>
                    <p className="mt-2 break-all font-mono text-lg font-bold text-ink">
                      {reference}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
