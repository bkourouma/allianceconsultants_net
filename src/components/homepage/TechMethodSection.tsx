import { LINES } from "@/lib/network";
import type { Homepage } from "@/lib/validators/content";

interface TechMethodSectionProps {
  techSection: Homepage["techSection"];
}

/**
 * Stack as a signage board: a full-bleed ink band, heading stacked over one
 * wide enamel-edged panel. No percentages, no levels — just what the products
 * are built with. The six line colours run along the foot of the band, towards
 * the terminus that follows.
 */
export function TechMethodSection({ techSection }: TechMethodSectionProps) {
  return (
    <section
      aria-labelledby="tech-section-title"
      className="relative bg-ink pt-16 text-white lg:pt-24"
    >
      <div className="wrap">
        <h2
          id="tech-section-title"
          className="t-h2 max-w-[22ch] text-white lg:max-w-[26ch]"
        >
          {techSection.title}
        </h2>

        <div className="mt-8 rounded-lg border border-white/25 p-2 sm:p-2.5 lg:mt-12">
          <div className="grid gap-8 rounded-[5px] border border-white/20 p-5 sm:p-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-12 lg:p-9">
            <div>
              <p className="flex items-center gap-3 text-sm font-bold text-white">
                <span
                  aria-hidden
                  className="grid size-7 place-items-center rounded-full bg-white"
                >
                  <span className="size-3 rounded-full border-[3px] border-ink" />
                </span>
                Stack technique
              </p>
              <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-white/80">
                {techSection.methodSummary}
              </p>
            </div>

            <ul className="flex flex-wrap content-start gap-2.5">
              {techSection.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded bg-white px-3 py-1.5 text-sm font-bold leading-snug text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The six lines, heading for the terminus */}
      <div aria-hidden className="mt-16 flex h-2 lg:mt-24">
        {LINES.map((l) => (
          <span key={l.id} className="flex-1" style={{ background: l.color }} />
        ))}
      </div>
    </section>
  );
}
