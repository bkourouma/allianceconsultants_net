"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/shared/CTAButton";
import fx from "@/components/services/fx.module.css";
import { MODALITY_LABELS, type ModalityKey } from "./modalities";

/**
 * Selectable modality chips + the training CTA, for the closing stub. Picking
 * a modality presses a stamp under the chips; the choice is echoed so the
 * visitor can mention it in the request.
 */
export function ModalityPicker({ available }: { available: ModalityKey[] }) {
  const [picked, setPicked] = useState<ModalityKey | null>(null);
  return (
    <div className="w-full">
      {available.length > 0 && (
        <>
          <p
            id="modality-pick"
            className="font-display text-xl font-bold leading-tight text-ink"
          >
            Modalité souhaitée
          </p>
          <div
            role="group"
            aria-labelledby="modality-pick"
            className="mt-3 flex flex-wrap gap-2.5"
          >
            {available.map((k) => {
              const on = picked === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(on ? null : k)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 px-3.5 font-display text-base font-bold uppercase tracking-[0.05em] transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-expo)] active:translate-y-px",
                    on
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                      : "border-ink bg-white text-ink hover:bg-ink hover:text-white",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-[2px] border-2",
                      on
                        ? "border-white bg-white text-[var(--accent)]"
                        : "border-ink text-transparent",
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {MODALITY_LABELS[k]}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex min-h-[3.25rem] items-center">
            {picked && (
              <span
                key={picked}
                aria-hidden
                className={cn("stamp bg-white", fx.stampPress)}
              >
                {MODALITY_LABELS[picked]} retenu
              </span>
            )}
          </div>
          <p
            role="status"
            aria-live="polite"
            className="min-h-5 text-sm text-ink-soft"
          >
            {picked
              ? `Vous préférez : ${MODALITY_LABELS[picked].toLowerCase()}. Précisez-le dans votre demande.`
              : ""}
          </p>
        </>
      )}
      <div className="mt-4">
        <CTAButton
          intent="training"
          label="Demander un devis / S'inscrire"
          block="training-section"
          size="md"
          className="h-auto min-h-12 w-full px-4 py-2 text-center leading-tight"
        />
      </div>
    </div>
  );
}
