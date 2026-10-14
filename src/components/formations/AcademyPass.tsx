import { MODALITY_KEYS, MODALITY_LABELS } from "./modalities";
import { PassBarcode } from "./PassBarcode";

/**
 * Hero specimen: one blank access pass, tilted a few degrees. Everything it
 * prints is restated from the site's own content (modalities, "sur demande").
 * Decorative; expects an ancestor with `line-academie`.
 */
export function AcademyPass({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ transform: "rotate(2.4deg)" }}
    >
      <div className="coupon relative mx-auto w-full max-w-[22rem] overflow-hidden shadow-[0_22px_30px_-16px_rgba(15,42,90,0.38)]">
        <div className="relative h-24 bg-[var(--accent)] text-[var(--on-accent)]">
          <span className="absolute left-1/2 top-3.5 h-3 w-16 -translate-x-1/2 rounded-full border-2 border-ink bg-enamel" />
          <span className="absolute bottom-3 left-5 font-display text-[1.75rem] font-extrabold uppercase italic leading-none tracking-[0.04em]">
            Académie
          </span>
          <PassBarcode
            seed="academie-alliance"
            className="absolute bottom-3 right-5 h-6 w-20 text-white"
          />
        </div>
        <div className="space-y-4 px-5 pb-5 pt-5">
          <div>
            <p className="t-field">Titulaire</p>
            <p className="mt-1 font-display text-2xl font-bold leading-none text-ink">
              Vos équipes
            </p>
          </div>
          <div className="border-t border-rule pt-3">
            <p className="t-field">Accès</p>
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-display text-lg font-bold leading-none text-ink">
              {MODALITY_KEYS.map((k) => (
                <span key={k}>{MODALITY_LABELS[k]}</span>
              ))}
            </p>
          </div>
        </div>
        <div className="border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-3">
          <p className="t-field">Programme et tarifs sur demande</p>
        </div>
      </div>
    </div>
  );
}
