import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { Training } from "@/lib/validators/content";

interface TrainingCardProps {
  training: Training;
}

const MODALITY_LABELS = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  intra: "Intra-entreprise",
} as const;

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
    <article className="line-academie group relative flex h-full flex-col rounded-lg bg-panel p-5 ring-1 ring-rule transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-16px_rgba(11,27,58,0.35)]">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]"
        >
          <GraduationCap className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-balance text-ink">
            <Link
              href={`/formations/${training.slug}`}
              className="after:absolute after:inset-0"
            >
              {training.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm font-semibold text-ink-mute">
            {training.category}
          </p>
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
        {training.shortDescription}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Modalités">
        {activeModalities.map((label) => (
          <li
            key={label}
            className="rounded-full bg-enamel px-2.5 py-1 text-xs font-bold text-ink ring-1 ring-inset ring-rule"
          >
            {label}
          </li>
        ))}
      </ul>

      <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-ink">
        Voir le programme
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </p>
    </article>
  );
}
