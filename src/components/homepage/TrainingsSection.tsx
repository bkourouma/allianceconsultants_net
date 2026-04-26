"use client";

import Link from "next/link";
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

export function TrainingsSection({ trainingsSection, trainings }: TrainingsSectionProps) {
  function handleCatalogueClick() {
    trackEvent("Trainings", "ClickCTA", "catalogue");
  }

  return (
    <section className="py-16 lg:py-24 bg-white" aria-labelledby="trainings-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="trainings-title"
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            {trainingsSection.title}
          </h2>
          {trainingsSection.intro && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {trainingsSection.intro}
            </p>
          )}

          {/* Modalités globales */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {trainingsSection.modalities.map((modality) => (
              <span
                key={modality}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700"
              >
                <span aria-hidden="true">{MODALITY_ICONS[modality] ?? "📚"}</span>
                {modality}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training) => (
            <TrainingCard key={training.slug} training={training} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/formations"
            onClick={handleCatalogueClick}
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary)] px-6 py-3 text-base font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
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
      </div>
    </section>
  );
}
