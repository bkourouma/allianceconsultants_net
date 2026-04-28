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
  const activeModalities = (
    Object.entries(training.modalities) as [
      keyof typeof MODALITY_LABELS,
      boolean,
    ][]
  )
    .filter(([, enabled]) => enabled)
    .map(([key]) => MODALITY_LABELS[key]);

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg lg:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {training.category}
      </p>
      <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight text-slate-900">
        {training.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
        {training.shortDescription}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {activeModalities.map((label) => (
          <span
            key={label}
            className="inline-flex items-center rounded-full bg-primary/[0.08] px-2.5 py-1 text-xs font-medium text-primary"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <Link
          href={`/formations/${training.slug}`}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
        >
          Voir le programme →
        </Link>
      </div>
    </article>
  );
}
