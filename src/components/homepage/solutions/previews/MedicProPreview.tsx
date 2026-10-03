"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Chip, Pill, PreviewFrame } from "./PreviewFrame";

const ITEMS = [
  { product: "Amoxicilline 500 mg, gélules", country: "Côte d'Ivoire", months: 9 },
  { product: "Paracétamol 1 g, comprimés", country: "Sénégal", months: 2 },
  { product: "Artéméther-luméfantrine", country: "Cameroun", months: 5 },
  { product: "Ibuprofène 400 mg", country: "Côte d'Ivoire", months: -1 },
  { product: "Métformine 850 mg", country: "Sénégal", months: 14 },
] as const;

const WINDOWS = [3, 6, 12] as const;
const SPAN = 18; // months shown on the track

type Status = "ok" | "warn" | "bad";

function statusOf(months: number, window: number): Status {
  if (months < 0) return "bad";
  return months <= window ? "warn" : "ok";
}

export function MedicProPreview({ name }: { name: string }) {
  const [win, setWin] = useState<(typeof WINDOWS)[number]>(6);
  const counts = { ok: 0, warn: 0, bad: 0 };
  ITEMS.forEach((i) => counts[statusOf(i.months, win)]++);

  return (
    <PreviewFrame product={name} module="Suivi des visas">
      <div className="flex h-full flex-col gap-3">
        <div role="group" aria-label="Fenêtre d'anticipation" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[0.8125rem] font-semibold text-ink-soft">Anticiper</span>
          {WINDOWS.map((w) => (
            <Chip key={w} pressed={win === w} onClick={() => setWin(w)}>
              {w} mois
            </Chip>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-[0.8125rem] font-semibold text-ink-soft">
          {counts.bad} expiré · {counts.warn} à renouveler · {counts.ok} valide{counts.ok > 1 ? "s" : ""}
        </p>
        <ul className="-mt-1 min-h-0 flex-1 list-none divide-y divide-rule overflow-y-auto p-0">
          {ITEMS.map((it) => {
            const st = statusOf(it.months, win);
            const pos = Math.min(Math.max(it.months, 0), SPAN) / SPAN;
            return (
              <li key={it.product} className="py-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-snug">{it.product}</span>
                    <span className="block text-[0.8125rem] text-ink-soft">
                      {it.country} · {it.months < 0 ? "visa expiré" : `expire dans ${it.months} mois`}
                    </span>
                  </span>
                  {st === "ok" && (
                    <Pill tone="ok" icon={<CheckCircle2 aria-hidden className="size-3.5" strokeWidth={2} />}>
                      Valide
                    </Pill>
                  )}
                  {st === "warn" && (
                    <Pill tone="warn" icon={<Clock aria-hidden className="size-3.5" strokeWidth={2} />}>
                      À renouveler
                    </Pill>
                  )}
                  {st === "bad" && (
                    <Pill tone="bad" icon={<AlertTriangle aria-hidden className="size-3.5" strokeWidth={2} />}>
                      Expiré
                    </Pill>
                  )}
                </div>
                {/* timeline: shaded anticipation window + expiry marker */}
                <div aria-hidden className="relative mt-2 h-2 rounded-full bg-enamel">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]/25 transition-[width] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
                    style={{ width: `${(win / SPAN) * 100}%` }}
                  />
                  <span
                    className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--accent)] bg-panel transition-[left] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
                    style={{ left: `${pos * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </PreviewFrame>
  );
}
