"use client";

import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { TrainingCard } from "@/components/shared/TrainingCard";
import { CTAButton } from "@/components/shared/CTAButton";
import { trackEvent } from "@/lib/matomo";
import type { Homepage, Training } from "@/lib/validators/content";

interface TrainingsSectionProps {
  trainingsSection: Homepage["trainingsSection"];
  trainings: Training[];
}

const MODALITY_ICONS: Record<string, string> = {
  "Présentiel en salle": "🏫",
  "Distanciel en ligne": "💻",
  "Intra-entreprise": "🏢",
};

export function TrainingsSection({
  trainingsSection,
  trainings,
}: TrainingsSectionProps) {
  function handleCatalogueClick() {
    trackEvent("Trainings", "ClickCTA", "catalogue");
  }

  return (
    <Section bg="white" aria-labelledby="trainings-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Montée en compétences
        </p>
        <h2
          id="trainings-title"
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          {trainingsSection.title}
        </h2>
        {trainingsSection.intro && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {trainingsSection.intro}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {trainingsSection.modalities.map((modality) => (
            <span
              key={modality}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
            >
              <span aria-hidden="true">
                {MODALITY_ICONS[modality] ?? "📚"}
              </span>
              {modality}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {trainings.map((training) => (
          <TrainingCard key={training.slug} training={training} />
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Link
          href="/formations"
          onClick={handleCatalogueClick}
          className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-primary px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Voir le catalogue
        </Link>
        <CTAButton
          intent="training"
          label="Demander une formation entreprise"
          block="training-section"
          size="md"
        />
      </div>
    </Section>
  );
}
