"use client";

import { useId, useState } from "react";
import { CheckRow, Pill, PreviewFrame, formatFcfa } from "./PreviewFrame";
import { cn } from "@/lib/utils";

interface Bien {
  id: string;
  label: string;
  rent: number;
  rented: boolean;
}

const INITIAL: Bien[] = [
  { id: "b1", label: "Villa 4 pièces — Cocody", rent: 450000, rented: true },
  { id: "b2", label: "Appartement F3 — Marcory", rent: 250000, rented: false },
  { id: "b3", label: "Studio — Plateau", rent: 150000, rented: true },
  { id: "b4", label: "Local commercial — Yopougon", rent: 300000, rented: true },
];

const TABS = ["Catalogue de biens", "Quittances et appels de loyer"] as const;
type Tab = (typeof TABS)[number];

export function ImmoTopiaPreview({ name }: { name: string }) {
  const uid = useId();
  const [tab, setTab] = useState<Tab>(TABS[0]);
  const [biens, setBiens] = useState<Bien[]>(INITIAL);
  const [paid, setPaid] = useState<Record<string, boolean>>({ b1: true });

  const leased = biens.filter((b) => b.rented);
  const due = leased.reduce((s, b) => s + b.rent, 0);
  const cashed = leased.filter((b) => paid[b.id]).reduce((s, b) => s + b.rent, 0);

  function setRented(id: string, rented: boolean) {
    setBiens((prev) => prev.map((b) => (b.id === id ? { ...b, rented } : b)));
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next]);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  }

  return (
    <PreviewFrame product={name} module={tab}>
      <div className="flex h-full flex-col gap-3">
        <div role="tablist" aria-label="Modules ImmoTopia" className="flex flex-wrap gap-1.5">
          {TABS.map((t, i) => (
            <button
              key={t}
              id={`${uid}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={tab === t}
              aria-controls={`${uid}-panel`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.8125rem] font-bold transition-colors duration-200 motion-reduce:transition-none sm:min-h-8",
                tab === t
                  ? "bg-[var(--accent)] text-[var(--on-accent)] ring-2 ring-inset ring-ink"
                  : "bg-enamel text-ink ring-1 ring-inset ring-rule hover:bg-rule/60",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${TABS.indexOf(tab)}`}
          className="flex min-h-0 flex-1 flex-col"
        >
          {tab === TABS[0] ? (
            <>
              <ul className="min-h-0 flex-1 list-none divide-y divide-rule overflow-y-auto p-0">
                {biens.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-snug">{b.label}</span>
                      <span className="mt-0.5 block">
                        {b.rented ? (
                          <Pill tone="neutral">Loué · {formatFcfa(b.rent)}/mois</Pill>
                        ) : (
                          <Pill tone="ok">Disponible</Pill>
                        )}
                      </span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={b.rented}
                      aria-label={`${b.label} : loué`}
                      onClick={() => setRented(b.id, !b.rented)}
                      className="relative grid min-h-11 w-14 shrink-0 place-items-center sm:min-h-9"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "relative h-6 w-11 rounded-full ring-2 ring-inset ring-ink transition-colors duration-200 motion-reduce:transition-none",
                          b.rented ? "bg-[var(--accent)]" : "bg-panel",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 size-4 rounded-full bg-ink transition-[left] duration-200 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                            b.rented ? "left-6" : "left-1",
                          )}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p role="status" aria-live="polite" className="border-t border-rule pt-2 text-[0.8125rem] font-semibold text-ink-soft">
                {leased.length} bien{leased.length > 1 ? "s" : ""} loué{leased.length > 1 ? "s" : ""} sur {biens.length}
              </p>
            </>
          ) : (
            <>
              <ul className="min-h-0 flex-1 list-none divide-y divide-rule overflow-y-auto p-0">
                {leased.map((b) => (
                  <li key={b.id}>
                    <CheckRow
                      checked={!!paid[b.id]}
                      onChange={(v) => setPaid((p) => ({ ...p, [b.id]: v }))}
                      className="justify-between py-1"
                    >
                      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                        <span className="min-w-0 text-sm font-bold leading-snug">{b.label}</span>
                        <span className="t-num shrink-0 text-[0.8125rem] font-semibold text-ink-soft">
                          {formatFcfa(b.rent)}
                        </span>
                      </span>
                    </CheckRow>
                  </li>
                ))}
                {leased.length === 0 && (
                  <li className="py-6 text-sm text-ink-soft">
                    Aucun bien loué. Basculez un bien en « loué » dans le catalogue.
                  </li>
                )}
              </ul>
              <div className="border-t border-rule pt-2">
                <p role="status" aria-live="polite" className="t-num text-[0.8125rem] font-bold text-ink">
                  Encaissé : {formatFcfa(cashed)} sur {formatFcfa(due)}
                </p>
                <div aria-hidden className="mt-1.5 h-2 overflow-hidden rounded-full bg-enamel">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
                    style={{ width: `${due ? (cashed / due) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PreviewFrame>
  );
}
