"use client";

import { useEffect, useMemo } from "react";
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-ink ring-2 ring-inset ring-ink transition-colors duration-200 hover:bg-ink hover:text-white";

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
      <div className="flex items-center gap-2.5 rounded-lg bg-panel px-3.5 py-3 text-sm font-semibold text-ink ring-1 ring-rule">
        <CheckCircle2 aria-hidden className="size-5 shrink-0 text-[var(--accent)]" strokeWidth={2} />
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
    <div className="relative overflow-hidden rounded-lg bg-panel p-4 pt-5 ring-1 ring-rule">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[var(--accent)]" />
      <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-ink">
        {calendlyUrl ? "Réservez votre démonstration" : "Organisons votre démonstration"}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        {calendlyUrl
          ? "Choisissez un créneau avec un consultant d'Alliance Consultants."
          : "Un consultant vous contacte sous 24 à 48 heures ouvrées. Vous pouvez aussi nous joindre directement."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {calendlyUrl ? (
          <button
            type="button"
            onClick={onOpen}
            className="group/cta inline-flex h-12 items-center justify-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-[0.9375rem] font-bold text-white transition-[background-color,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-night-2 active:translate-y-px"
          >
            Choisir un créneau
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]"
            >
              <CalendarCheck className="size-4" strokeWidth={2} />
            </span>
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
    <div className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="flex items-center gap-2 border-b border-rule px-2 py-1.5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-ink hover:bg-enamel"
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
      <p className="border-t border-rule px-3.5 py-2 text-xs text-ink-mute">
        Réservation assurée par Calendly, service tiers.
      </p>
    </div>
  );
}
