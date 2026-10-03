"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/shared/CTAButton";
import { MODALITY_LABELS, type ModalityKey } from "./modalities";

/**
 * Selectable modality chips + the training CTA, for the terminus panel
 * (dark background). The choice is echoed so the visitor can mention it.
 */
export function ModalityPicker({ available }: { available: ModalityKey[] }) {
  const [picked, setPicked] = useState<ModalityKey | null>(null);
  return (
    <div className="w-full">
      {available.length > 0 && (
        <>
          <p
            id="modality-pick"
            className="font-display text-lg font-semibold text-white"
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
                    "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold transition-colors duration-200",
                    on
                      ? "bg-white text-ink"
                      : "bg-transparent text-white ring-2 ring-inset ring-white/60 hover:ring-white",
                  )}
                >
                  {on && <Check aria-hidden className="size-4" strokeWidth={2} />}
                  {MODALITY_LABELS[k]}
                </button>
              );
            })}
          </div>
          <p
            role="status"
            aria-live="polite"
            className="mt-3 min-h-6 text-sm text-white/85"
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
          size="lg"
          onDark
        />
      </div>
    </div>
  );
}
