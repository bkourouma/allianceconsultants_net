"use client";

import { useId, useState } from "react";
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Perforation } from "@/components/about/CouponKit";
import { LINES, lineStyle, type NetworkLine } from "@/lib/network";
import { cn } from "@/lib/utils";

export interface ContactInfo {
  email: string;
  phones: string[];
  whatsapp?: string | null;
  address: string;
  hours: string;
}

export type TripSelection =
  | { kind: "line"; line: NetworkLine }
  | { kind: "service"; label: string }
  | null;

interface TripSummaryProps {
  selection: TripSelection;
  /** Third step label, driven by the type of request. */
  intentStation: string;
  intentDescription: string;
  /** Short label of the chosen type of request (« Démo », « Contact »…). */
  intentLabel?: string;
  contact?: ContactInfo;
  className?: string;
}

const CONTACT_ROW =
  "flex min-h-11 items-center gap-3 px-2 py-1.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-enamel";

/**
 * Le récépissé — the receipt coupon next to the booking form. It updates live
 * with the product chosen in the form (coupon number, name, colour tab) and
 * lists what happens next, plus the direct contact details. On phones it sits
 * above the form with only its header open; the steps fold behind a toggle.
 */
export function TripSummary({
  selection,
  intentStation,
  intentDescription,
  intentLabel,
  contact,
  className,
}: TripSummaryProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  const line = selection?.kind === "line" ? selection.line : null;
  const number = line
    ? String(LINES.findIndex((l) => l.id === line.id) + 1).padStart(2, "0")
    : null;
  const title = line
    ? line.name
    : selection?.kind === "service"
      ? selection.label
      : "Votre solution";
  const subtitle = line
    ? line.pitch
    : selection?.kind === "service"
      ? "Service associé à votre demande."
      : "Choisissez une solution : son coupon s'affiche ici.";
  const selectionKey = line?.id ?? (selection?.kind === "service" ? selection.label : "none");

  const steps = [
    {
      name: "Votre demande",
      text: "Le formulaire ci-contre : quelques lignes sur votre besoin suffisent.",
    },
    {
      name: "Réponse",
      text: "Un consultant revient vers vous sous 24 à 48 heures ouvrées.",
    },
    { name: intentStation, text: intentDescription },
    {
      name: "Déploiement",
      text: "Une estimation indicative et un plan d'action.",
    },
  ];

  const whatsappDigits = contact?.whatsapp?.replace(/\D/g, "");

  return (
    <aside
      aria-label="Récépissé de votre demande"
      className={cn("coupon", className)}
      style={line ? lineStyle(line.id) : undefined}
    >
      {/* En-tête du coupon : numéro, produit, onglet couleur */}
      <div className="flex min-h-[3.25rem] overflow-hidden rounded-t-[2px] bg-ink text-white">
        <span
          key={`n-${selectionKey}`}
          aria-hidden
          className="t-num grid w-14 shrink-0 animate-fade-up place-items-center border-r-2 border-ink bg-panel font-display text-[1.75rem] font-extrabold leading-none text-carbon"
        >
          {number ?? "—"}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4" aria-live="polite">
          <div key={`t-${selectionKey}`} className="min-w-0 animate-fade-up">
            <p className="t-field !text-[0.625rem] !text-white/75">Récépissé</p>
            <p className="truncate font-display text-xl font-bold uppercase leading-tight tracking-[0.06em]">
              {title}
            </p>
          </div>
        </div>
        {line ? (
          <span className="t-field hidden shrink-0 items-center bg-[var(--accent)] px-3 !text-[0.6875rem] !text-[var(--on-accent)] transition-colors duration-300 sm:flex lg:hidden xl:flex">
            {line.sector}
          </span>
        ) : null}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="grid w-12 shrink-0 place-items-center border-l-2 border-white/25 transition-colors hover:bg-white/10 lg:hidden"
        >
          <span className="sr-only">
            {open ? "Masquer les étapes" : "Voir les étapes"}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-5 transition-transform duration-300 ease-[var(--ease-out-expo)]",
              open && "rotate-180",
            )}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Ce que vous demandez */}
      <div className="px-5 pb-4 pt-4 sm:px-6">
        <p key={`s-${selectionKey}`} className="animate-fade-up text-[0.9375rem] leading-snug text-ink-soft">
          {subtitle}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 border-t border-dashed border-ink-mute/60 pt-3">
          <div>
            <dt className="t-field">Type</dt>
            <dd className="font-display text-lg font-bold leading-tight text-ink">
              {intentLabel ?? intentStation}
            </dd>
          </div>
          <div>
            <dt className="t-field">Coupon</dt>
            <dd className="t-num font-display text-lg font-bold leading-tight text-ink">
              {number ? `n° ${number}` : "à choisir"}
            </dd>
          </div>
        </dl>
      </div>

      <div id={bodyId} className={cn(open ? "block" : "hidden", "lg:block")}>
        <Perforation />

        <div className="px-5 py-5 sm:px-6">
          <p className="t-field">Et ensuite</p>
          <ol className="mt-3">
            {steps.map((s, i) => (
              <li key={s.name} className="relative flex gap-3.5 pb-4 last:pb-0">
                <span aria-hidden className="relative mt-1 flex flex-col items-center">
                  <span className="block size-3 shrink-0 rounded-[2px] border-2 border-ink bg-panel" />
                  {i < steps.length - 1 ? (
                    <span className="absolute top-4 h-[calc(100%+0.25rem)] border-l-2 border-dashed border-ink-mute/60" />
                  ) : null}
                </span>
                <div>
                  <p className="font-display text-base font-bold leading-tight text-ink">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-ink-soft">
                    {s.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-dashed border-ink-mute/60 pt-3 text-sm text-ink-soft">
            Pas d&apos;engagement. Aucune relance commerciale intrusive.
          </p>
        </div>

        {contact ? (
          <>
            <Perforation />
            <div className="rounded-b-[2px] bg-[#f6f5fb] p-3 sm:p-4">
              <p className="t-field px-2 pb-1 pt-1">Nous joindre directement</p>
              <ul>
                {contact.phones.map((p) => (
                  <li key={p}>
                    <a href={`tel:${p.replace(/\s+/g, "")}`} className={CONTACT_ROW}>
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
                <li className="flex min-h-11 items-center gap-3 px-2 py-1.5 text-sm text-ink-soft">
                  <MapPin aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  {contact.address}
                </li>
                <li className="flex min-h-11 items-center gap-3 px-2 py-1.5 text-sm text-ink-soft">
                  <Clock aria-hidden className="size-5 shrink-0 text-ink-mute" strokeWidth={1.75} />
                  {contact.hours}
                </li>
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}
