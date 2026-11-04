"use client";

import { useEffect, useMemo } from "react";
import styles from "./assistant.module.css";
import { ArrowLeft, CalendarCheck, CheckCircle2, MessageCircle, Phone } from "lucide-react";

const CALENDLY_ORIGIN = "https://calendly.com";

interface ContactChannels {
  phone: string | null;
  whatsapp: string | null;
}

function digits(value: string): string {
  return value.replace(/\D+/g, "");
}

const ACTION_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] px-4 font-display text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-ink ring-2 ring-inset ring-ink transition-colors duration-200 hover:bg-ink hover:text-white";

/** Carte affichée dans le fil : propose la réservation, ou la confirme. */
export function BookingCard({
  status,
  calendlyUrl,
  contact,
  onOpen,
}: {
  status: "prompt" | "done";
  calendlyUrl: string | null;
  contact: ContactChannels;
  onOpen: () => void;
}) {
  if (status === "done") {
    return (
      <div className="coupon flex items-center gap-2.5 px-3.5 py-3 text-sm font-semibold text-ink">
        <CheckCircle2 aria-hidden className="size-5 shrink-0 text-ink" strokeWidth={2} />
        Démonstration réservée.
      </div>
    );
  }

  const whatsapp = contact.whatsapp
    ? `https://wa.me/${digits(contact.whatsapp)}?text=${encodeURIComponent(
        "Bonjour, je viens du site allianceconsultants.net et je souhaite organiser une démonstration.",
      )}`
    : null;

  return (
    <div className={`${styles.panel} coupon p-4`}>
      <p aria-hidden className="t-field mb-1">
        Coupon détachable
      </p>
      <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink">
        {calendlyUrl ? "Réservez votre démonstration" : "Organisons votre démonstration"}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        {calendlyUrl
          ? "Choisissez un créneau avec un consultant d'Alliance Consultants."
          : "Un consultant vous contacte sous 24 à 48 heures ouvrées. Vous pouvez aussi nous joindre directement."}
      </p>
      <div className="tear -mx-4 mt-3" aria-hidden />
      <div className="mt-3 flex flex-wrap gap-2">
        {calendlyUrl ? (
          <button
            type="button"
            onClick={onOpen}
            className="group/cta inline-flex h-12 items-center justify-center gap-2.5 rounded-[3px] bg-red px-5 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] transition-[background-color,transform] duration-200 ease-[var(--ease-out-expo)] hover:bg-red-dk active:translate-y-[2px] active:shadow-none"
          >
            Choisir un créneau
            <CalendarCheck aria-hidden className="size-4" strokeWidth={2.25} />
          </button>
        ) : null}
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={ACTION_CLASS}>
            <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
            WhatsApp
          </a>
        ) : null}
        {!calendlyUrl && contact.phone ? (
          <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className={ACTION_CLASS}>
            <Phone aria-hidden className="size-4" strokeWidth={2} />
            Appeler
          </a>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Calendly en vue plein panneau. L'iframe (et donc tout échange avec Calendly) n'est chargée
 * qu'après un clic explicite du visiteur sur « Choisir un créneau ».
 */
export function BookingView({
  calendlyUrl,
  prefill,
  onBack,
  onScheduled,
}: {
  calendlyUrl: string;
  prefill: { name: string; email: string } | null;
  onBack: () => void;
  onScheduled: () => void;
}) {
  const src = useMemo(() => {
    const url = new URL(calendlyUrl);
    url.searchParams.set("embed_domain", window.location.hostname);
    url.searchParams.set("embed_type", "Inline");
    if (prefill?.name) url.searchParams.set("name", prefill.name);
    if (prefill?.email) url.searchParams.set("email", prefill.email);
    return url.toString();
  }, [calendlyUrl, prefill]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CALENDLY_ORIGIN) return;
      const data = event.data as { event?: string } | null;
      if (data && data.event === "calendly.event_scheduled") onScheduled();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onScheduled]);

  return (
    <div className={`${styles.panel} flex min-h-0 flex-1 flex-col bg-panel`}>
      <div className="flex items-center gap-2 border-b-2 border-dashed border-ink px-2 py-1.5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-[3px] px-3 text-sm font-bold text-ink hover:bg-enamel"
        >
          <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
          Retour à la conversation
        </button>
      </div>
      <iframe
        title="Réservation d'une démonstration avec Calendly"
        src={src}
        className="min-h-0 w-full flex-1 border-0"
      />
      <p className="t-field border-t-2 border-dashed border-ink px-3.5 py-2">
        Réservation assurée par Calendly, service tiers.
      </p>
    </div>
  );
}
