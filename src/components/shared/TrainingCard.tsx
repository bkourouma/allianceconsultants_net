import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Training } from "@/lib/validators/content";

interface TrainingCardProps {
  training: Training;
}

const MODALITY_LABELS = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  intra: "Intra-entreprise",
} as const;

/**
 * Une formation en carte d'accès : coupon blanc à filet encre, bandeau
 * « Académie » (accent carbone), modalités en champs, lien vers le programme.
 */
export function TrainingCard({ training }: TrainingCardProps) {
  const activeModalities = (
    Object.entries(training.modalities) as [
      keyof typeof MODALITY_LABELS,
      boolean,
    ][]
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => MODALITY_LABELS[key]);

  return (
    <article className="line-academie coupon group relative flex h-full flex-col transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3 rounded-t-[2px] bg-ink px-4 py-2 text-white">
        <span className="t-field !text-white">Carte d&apos;accès</span>
        <span className="t-field rounded-[2px] bg-[var(--accent)] px-2 py-0.5 !text-[var(--on-accent)]">
          Académie
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="t-field">{training.category}</p>
        <h3 className="t-h3 mt-1.5 text-ink">
          <Link
            href={`/formations/${training.slug}`}
            className="after:absolute after:inset-0"
          >
            {training.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
          {training.shortDescription}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Modalités">
          {activeModalities.map((label) => (
            <li
              key={label}
              className="rounded-[3px] border-2 border-ink px-2 py-0.5 text-xs font-semibold text-ink"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      <p className="flex items-center justify-between gap-2 border-t-2 border-dashed border-ink bg-[#f6f5fb] px-5 py-3 font-display text-base font-bold uppercase tracking-[0.06em] text-ink">
        Voir le programme
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </p>
    </article>
  );
}
