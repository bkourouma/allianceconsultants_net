"use client";

import { useState } from "react";
import { Chip, LiveNote, PreviewFrame } from "./PreviewFrame";
import { cn } from "@/lib/utils";

const ACTES = ["Consultation", "Examen", "Contrôle"] as const;
type Acte = (typeof ACTES)[number];

const SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"] as const;

/** Slots already taken in the (fictional) shared agenda. */
const TAKEN: Record<string, { acte: Acte; who: string }> = {
  "08:30": { acte: "Consultation", who: "M. D." },
  "09:30": { acte: "Contrôle", who: "Mme T." },
  "10:30": { acte: "Examen", who: "M. K." },
};

export function CliniqueProPreview({ name }: { name: string }) {
  const [acte, setActe] = useState<Acte>("Consultation");
  const [booked, setBooked] = useState<Record<string, Acte>>({});
  const [note, setNote] = useState("Choisissez un type d'acte, puis un créneau libre.");

  const taken = Object.keys(TAKEN).length + Object.keys(booked).length;

  function toggle(slot: string) {
    if (booked[slot]) {
      const next = { ...booked };
      delete next[slot];
      setBooked(next);
      setNote(`Rendez-vous de ${slot} annulé.`);
    } else {
      setBooked({ ...booked, [slot]: acte });
      setNote(`${acte} réservé(e) à ${slot}.`);
    }
  }

  return (
    <PreviewFrame product={name} module="Agenda partagé">
      <div className="flex h-full flex-col gap-3">
        <div role="group" aria-label="Type d'acte" className="flex flex-wrap gap-1.5">
          {ACTES.map((a) => (
            <Chip key={a} pressed={acte === a} onClick={() => setActe(a)}>
              {a}
            </Chip>
          ))}
        </div>
        <ul className="grid min-h-0 flex-1 list-none grid-cols-2 content-start gap-2 overflow-y-auto p-0 sm:grid-cols-4">
          {SLOTS.map((slot) => {
            const t = TAKEN[slot];
            const mine = booked[slot];
            return (
              <li key={slot}>
                {t ? (
                  <div className="flex h-full min-h-16 flex-col justify-between rounded-md bg-enamel px-2.5 py-2 text-ink-soft ring-1 ring-inset ring-rule">
                    <span className="t-num text-sm font-extrabold">{slot}</span>
                    <span className="text-[0.75rem] font-semibold leading-tight">
                      {t.acte} · {t.who}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-pressed={!!mine}
                    onClick={() => toggle(slot)}
                    className={cn(
                      "flex h-full min-h-16 w-full flex-col justify-between rounded-md px-2.5 py-2 text-left transition-colors duration-200 motion-reduce:transition-none",
                      mine
                        ? "bg-[var(--accent)] text-[var(--on-accent)] ring-2 ring-inset ring-ink"
                        : "bg-panel text-ink ring-1 ring-inset ring-ink/40 hover:bg-enamel",
                    )}
                  >
                    <span className="t-num text-sm font-extrabold">{slot}</span>
                    <span className="text-[0.75rem] font-bold leading-tight">
                      {mine ? `${mine} · nouveau` : "Libre"}
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-rule pt-2">
          <LiveNote>{note}</LiveNote>
          <span className="t-num text-[0.8125rem] font-bold text-ink">
            {taken}/{SLOTS.length} créneaux occupés
          </span>
        </div>
      </div>
    </PreviewFrame>
  );
}
