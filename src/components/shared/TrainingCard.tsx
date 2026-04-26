import Link from "next/link";
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
  const activeModalities = (Object.entries(training.modalities) as [keyof typeof MODALITY_LABELS, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([key]) => MODALITY_LABELS[key]);

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
        {training.category}
      </p>
      <h3 className="mt-2 text-base font-bold text-gray-900">{training.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{training.shortDescription}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {activeModalities.map((label) => (
          <span
            key={label}
            className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {label}
          </span>
        ))}
      </div>

      <Link
        href={`/formations/${training.slug}`}
        className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
      >
        Voir le programme →
      </Link>
    </article>
  );
}
