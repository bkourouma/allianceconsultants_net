import { Section } from "@/components/ui/Section";
import type { SolutionFeatureGroup } from "@/lib/validators/content";

interface FeatureGridProps {
  groups: SolutionFeatureGroup[];
}

export function FeatureGrid({ groups }: FeatureGridProps) {
  return (
    <Section bg="gray">
      <div className="mb-10 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Fonctionnalités clés
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Une plateforme modulaire, organisée par grands domaines fonctionnels.
        </p>
      </div>
      <div className="space-y-12">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-5 text-xl font-bold text-[var(--color-primary-dark)]">
              {group.title}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h4 className="mb-2 text-base font-semibold text-gray-900">
                    {feature.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
