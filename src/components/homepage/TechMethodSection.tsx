import { Section } from "@/components/ui/Section";
import type { Homepage } from "@/lib/validators/content";

interface TechMethodSectionProps {
  techSection: Homepage["techSection"];
}

export function TechMethodSection({ techSection }: TechMethodSectionProps) {
  return (
    <Section bg="gray" aria-labelledby="tech-section-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Stack &amp; méthode
        </p>
        <h2
          id="tech-section-title"
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          {techSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          {techSection.methodSummary}
        </p>
      </div>

      <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:gap-3">
        {techSection.stack.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            {tech}
          </span>
        ))}
      </div>
    </Section>
  );
}
