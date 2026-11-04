import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Perforation } from "@/components/about/CouponKit";
import { PillLink } from "@/components/about/PillLink";
import { getSiteSettings } from "@/lib/content";

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
  "flex min-h-14 items-center gap-4 border-b border-dashed border-ink-mute/50 px-5 py-3 transition-colors duration-200 hover:bg-panel sm:px-7";

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
      <div className="wrap pb-20 pt-10 lg:pb-28 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-16">
          {/* Le coupon d'erreur : calme, avec le talon pour réessayer */}
          <div className="coupon overflow-hidden">
            <div className="bg-ink px-5 py-2.5 sm:px-8 lg:px-10">
              <p className="t-field !text-white">Envoi non abouti</p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <h1 className="t-h2 max-w-[20ch] text-ink">
                Nous n&apos;avons pas pu enregistrer votre demande
              </h1>
              <p className="t-lead mt-6">{message}</p>
              <p className="t-body mt-4 text-ink-soft">{next}</p>
            </div>
            <Perforation />
            <div className="flex flex-wrap items-center gap-3 rounded-b-[2px] bg-[#f6f5fb] p-5 sm:gap-4 sm:p-8 lg:px-10">
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

          <div className="coupon overflow-hidden">
            <div className="bg-ink px-5 py-3 sm:px-7">
              <h2 className="t-h3 text-white">Nous joindre directement</h2>
            </div>
            <ul className="bg-[#f6f5fb] [&>li:last-child>a]:border-b-0">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/\s+/g, "")}`} className={CONTACT_ROW}>
                    <Phone aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                    <span>
                      <span className="t-field block">Téléphone</span>
                      <span className="t-num font-display text-xl font-bold text-ink">{p}</span>
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
                      <span className="t-field block">WhatsApp</span>
                      <span className="t-num font-display text-xl font-bold text-ink">{contact.whatsapp}</span>
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <a href={`mailto:${contact.email}`} className={CONTACT_ROW}>
                  <Mail aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  <span className="min-w-0">
                    <span className="t-field block">E-mail</span>
                    <span className="break-all font-display text-xl font-bold text-ink">{contact.email}</span>
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
