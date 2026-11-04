"use client";

import { useState } from "react";
import { BadgeCheck, Home, MessageCircle } from "lucide-react";
import { Chip, LiveNote, PreviewFrame, formatFcfa } from "./PreviewFrame";

type Mode = "louer" | "vendre";

const LISTINGS: {
  id: string;
  title: string;
  place: string;
  mode: Mode;
  price: number;
  rooms: string;
  verified: boolean;
}[] = [
  { id: "l1", title: "Appartement 3 pièces", place: "Cocody, Abidjan", mode: "louer", price: 250000, rooms: "2 chambres", verified: true },
  { id: "l2", title: "Studio meublé", place: "Marcory, Abidjan", mode: "louer", price: 120000, rooms: "1 chambre", verified: false },
  { id: "l3", title: "Villa 5 pièces", place: "Bingerville", mode: "vendre", price: 65000000, rooms: "4 chambres", verified: true },
  { id: "l4", title: "Terrain de 300 m²", place: "Grand-Bassam", mode: "vendre", price: 18000000, rooms: "Terrain", verified: false },
];

export function AnnoncesPreview({ name }: { name: string }) {
  const [mode, setMode] = useState<Mode>("louer");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [note, setNote] = useState("Filtrez, puis essayez le bouton de contact.");

  const shown = LISTINGS.filter((l) => l.mode === mode && (!verifiedOnly || l.verified));

  return (
    <PreviewFrame product={name} module="Recherche multi-critères">
      <div className="flex h-full flex-col gap-3">
        <div role="group" aria-label="Filtres" className="flex flex-wrap gap-1.5">
          <Chip pressed={mode === "louer"} onClick={() => setMode("louer")}>
            À louer
          </Chip>
          <Chip pressed={mode === "vendre"} onClick={() => setMode("vendre")}>
            À vendre
          </Chip>
          <Chip pressed={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
            Compte vérifié
          </Chip>
        </div>
        <ul className="min-h-0 flex-1 list-none space-y-2 overflow-y-auto p-0">
          {shown.map((l) => (
            <li
              key={l.id}
              className="flex items-stretch gap-3 rounded-[3px] bg-enamel p-2 ring-1 ring-inset ring-rule"
            >
              <span
                aria-hidden
                className="grid w-16 shrink-0 place-items-center rounded-[2px] bg-panel text-ink ring-[1.5px] ring-inset ring-ink sm:w-20"
              >
                <Home className="size-6" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-1.5 text-sm font-bold leading-snug">
                  {l.title}
                  {l.verified && (
                    <span className="inline-flex items-center gap-0.5 text-[0.75rem] font-bold text-ink-soft">
                      <BadgeCheck aria-hidden className="size-3.5" strokeWidth={2} />
                      Vérifié
                    </span>
                  )}
                </span>
                <span className="block text-[0.8125rem] text-ink-soft">
                  {l.place} · {l.rooms}
                </span>
                <span className="t-num block text-sm font-extrabold">
                  {formatFcfa(l.price)}
                  {l.mode === "louer" ? " / mois" : ""}
                </span>
              </span>
              <button
                type="button"
                aria-disabled="true"
                onClick={() =>
                  setNote("Aperçu : le contact WhatsApp est désactivé dans cette démonstration.")
                }
                className="inline-flex min-h-11 shrink-0 cursor-not-allowed items-center gap-1.5 self-center rounded-[3px] bg-panel px-3 text-[0.75rem] font-bold text-ink-mute ring-1 ring-inset ring-rule sm:min-h-9"
              >
                <MessageCircle aria-hidden className="size-4" strokeWidth={2} />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sr-only sm:hidden">WhatsApp (désactivé dans l&apos;aperçu)</span>
              </button>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="py-6 text-sm text-ink-soft">Aucune annonce ne correspond à ces filtres.</li>
          )}
        </ul>
        <LiveNote className="border-t border-rule pt-2">
          {shown.length} annonce{shown.length > 1 ? "s" : ""} · {note}
        </LiveNote>
      </div>
    </PreviewFrame>
  );
}
