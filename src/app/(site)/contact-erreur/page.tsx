import type { Metadata } from "next";
import { Mail, MessageCircle, Phone, TriangleAlert } from "lucide-react";
import { PillLink } from "@/components/about/PillLink";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Erreur — Alliance Consultants" },
  description: "Une erreur est survenue lors de l'envoi de votre demande.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

const REASON_MESSAGES: Record<string, string> = {
  validation:
    "Certaines informations du formulaire sont manquantes ou incorrectes. Merci de vérifier les champs obligatoires (nom, e-mail, téléphone et consentement).",
  rate_limited:
    "Vous avez soumis plusieurs demandes en peu de temps. Merci de patienter quelques minutes avant de réessayer.",
  server:
    "Une erreur technique est survenue de notre côté. Notre équipe a été notifiée. Merci de réessayer dans quelques instants.",
};

const REASON_NEXT: Record<string, string> = {
  validation:
    "Revenez au formulaire : vos informations sont à saisir de nouveau, les champs en erreur seront signalés.",
  rate_limited:
    "Patientez quelques minutes puis réessayez, ou joignez-nous directement.",
  server:
    "Réessayez dans un instant. Si le problème persiste, joignez-nous directement : nous prendrons votre demande par téléphone ou par message.",
};

const CONTACT_ROW =
  "flex min-h-12 items-center gap-4 rounded-lg px-3 py-2 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-enamel";

export default async function ContactErreurPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reason = params.reason ?? "";
  const message =
    REASON_MESSAGES[reason] ??
    "Une erreur est survenue lors de l'envoi de votre demande. Merci de réessayer.";
  const next =
    REASON_NEXT[reason] ??
    "Réessayez dans un instant, ou joignez-nous directement.";

  const { contact } = await getSiteSettings();
  const whatsappDigits = contact.whatsapp?.replace(/\D/g, "");

  return (
    <section className="bg-enamel">
      {/* the line stops before the terminus */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 1600 120"
        preserveAspectRatio="xMidYMid slice"
        className="block h-24 w-full sm:h-28"
      >
        {[34, 60, 86].map((y, i) => (
          <g key={y}>
            <path
              d={`M0 ${y} H${560 + i * 40}`}
              stroke={["#1457f5", "#098240", "#f26a1b"][i]}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M${640 + i * 40} ${y} H1600`}
              stroke="#d5dbea"
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray="2 22"
              fill="none"
            />
          </g>
        ))}
        <rect x="596" y="14" width="12" height="92" rx="3" fill="#e0245e" />
      </svg>

      <div className="wrap pb-16 pt-8 lg:pb-24 lg:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <span className="grid size-14 place-items-center rounded-full bg-[#e0245e] text-white">
              <TriangleAlert aria-hidden className="size-7" strokeWidth={2} />
            </span>
            <h1 className="t-display mt-6 max-w-[18ch] text-ink">
              Nous n&apos;avons pas pu enregistrer votre demande
            </h1>
            <p className="t-lead mt-6">{message}</p>
            <p className="t-body mt-4 text-ink-soft">{next}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <PillLink href="/contact-demo" size="lg">
                Réessayer
              </PillLink>
              <PillLink href="/solutions" size="lg" variant="secondary">
                Retour aux solutions
              </PillLink>
              <PillLink href="/" size="lg" variant="secondary">
                Retour à l&apos;accueil
              </PillLink>
            </div>
          </div>

          <div className="self-start rounded-lg bg-panel p-4 ring-1 ring-rule sm:p-6">
            <h2 className="t-h3 px-3 text-ink">Nous joindre directement</h2>
            <ul className="mt-4 grid gap-1">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    className={CONTACT_ROW}
                  >
                    <Phone aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="sr-only">Téléphone : </span>
                      {p}
                    </span>
                  </a>
                </li>
              ))}
              {whatsappDigits ? (
                <li>
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CONTACT_ROW}
                  >
                    <MessageCircle aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="sr-only">WhatsApp : </span>
                      {contact.whatsapp}
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <a href={`mailto:${contact.email}`} className={CONTACT_ROW}>
                  <Mail aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="break-all">
                    <span className="sr-only">E-mail : </span>
                    {contact.email}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
