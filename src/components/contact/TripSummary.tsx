"use client";

import { useId, useState } from "react";
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { NetworkLine } from "@/lib/network";
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
  /** Station 3 label, driven by the type of request. */
  intentStation: string;
  intentDescription: string;
  contact?: ContactInfo;
  className?: string;
}

const CONTACT_ROW =
  "flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-enamel";

/**
 * « Votre trajet » — the summary panel next to the booking form. Its colour
 * field follows the solution line chosen in the form; the stations list what
 * happens next. On phones the stations fold away behind a toggle so the
 * form stays close to the top.
 */
export function TripSummary({
  selection,
  intentStation,
  intentDescription,
  contact,
  className,
}: TripSummaryProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  const line = selection?.kind === "line" ? selection.line : null;
  const title = line
    ? line.name
    : selection?.kind === "service"
      ? selection.label
      : "Choisissez votre ligne";
  const subtitle = line
    ? line.pitch
    : selection?.kind === "service"
      ? "Service : une correspondance sur le réseau."
      : "Sélectionnez une solution : la ligne qui vous attend s'affiche ici.";

  const stations = [
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
      aria-label="Votre trajet"
      className={cn(
        "overflow-hidden rounded-lg bg-panel ring-1 ring-rule",
        className,
      )}
    >
      <div
        className={cn(
          "relative p-5 transition-colors duration-500 ease-[var(--ease-out-expo)] sm:p-6",
          line ? "" : "bg-ink text-white",
        )}
        style={
          line
            ? { background: line.color, color: line.onColor }
            : undefined
        }
      >
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-full bg-white font-display text-xl font-extrabold text-ink"
          >
            {line ? (
              line.glyph
            ) : (
              <span className="size-5 rounded-full border-[4px] border-ink bg-white" />
            )}
          </span>
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="t-station">Votre trajet</p>
            <p className="font-display text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
              {title}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/20 transition-colors hover:bg-white/30 lg:hidden"
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
        <p className="mt-3 max-w-[44ch] text-[0.9375rem] leading-snug">
          {subtitle}
        </p>
      </div>

      <div id={bodyId} className={cn(open ? "block" : "hidden", "lg:block")}>
        <ol className="relative px-5 py-6 sm:px-6">
          <span
            aria-hidden
            className="absolute bottom-9 left-[1.6875rem] top-9 w-1.5 rounded-full transition-colors duration-500 sm:left-[1.9375rem]"
            style={{ background: line?.color ?? "var(--color-ink)" }}
          />
          {stations.map((s) => (
            <li key={s.name} className="relative flex gap-4 pb-5 last:pb-0">
              <span
                aria-hidden
                className="relative z-10 mt-0.5 block size-5 shrink-0 rounded-full border-[4px] border-ink bg-panel"
              />
              <div>
                <p className="font-display text-base font-bold leading-tight text-ink">
                  {s.name}
                </p>
                <p className="mt-1 text-sm leading-snug text-ink-soft">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="border-t border-dashed border-rule px-5 py-4 text-sm text-ink-soft sm:px-6">
          Pas d&apos;engagement. Aucune relance commerciale intrusive.
        </p>

        {contact ? (
          <div className="border-t border-rule bg-enamel/60 p-3 sm:p-4">
            <p className="t-station px-2 pb-1 pt-1 text-ink-mute">
              Nous joindre directement
            </p>
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
        ) : null}
      </div>
    </aside>
  );
}
