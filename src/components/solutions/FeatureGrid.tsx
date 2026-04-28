import { Section } from "@/components/ui/Section";
import type { SolutionFeatureGroup } from "@/lib/validators/content";

interface FeatureGridProps {
  groups: SolutionFeatureGroup[];
}

export function FeatureGrid({ groups }: FeatureGridProps) {
  return (
    <Section bg="white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Capacités fonctionnelles
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Fonctionnalités clés
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Une plateforme modulaire, organisée par grands domaines fonctionnels.
        </p>
      </div>

      <div className="mt-14 space-y-14 lg:space-y-20">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xl font-bold tracking-tight text-primary-dark sm:text-2xl">
              {group.title}
            </h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200/70 bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <h4 className="text-base font-semibold text-slate-900">
                    {feature.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
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
