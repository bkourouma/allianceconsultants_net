import { Section } from "@/components/ui/Section";
import type { Homepage } from "@/lib/validators/content";

interface TechMethodSectionProps {
  techSection: Homepage["techSection"];
}

export function TechMethodSection({ techSection }: TechMethodSectionProps) {
  return (
    <Section bg="gray" aria-labelledby="tech-section-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="tech-section-title"
          className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
        >
          {techSection.title}
        </h2>
        <p className="mt-4 text-lg text-gray-600">{techSection.methodSummary}</p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {techSection.stack.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
          >
            {tech}
          </span>
        ))}
      </div>
    </Section>
  );
}
