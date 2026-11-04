import type { Homepage } from "@/lib/validators/content";

interface TechMethodSectionProps {
  techSection: Homepage["techSection"];
}

/**
 * La stack en fiche technique : un coupon calme, filets encre, le résumé de
 * méthode d'un côté, les technologies en puces de l'autre. Pas de pourcentages,
 * pas de niveaux : seulement ce avec quoi les produits sont construits.
 */
export function TechMethodSection({ techSection }: TechMethodSectionProps) {
  return (
    <section
      aria-labelledby="tech-section-title"
      className="bg-enamel pb-16 pt-4 text-ink lg:pb-24"
    >
      <div className="wrap">
        <h2 id="tech-section-title" className="t-h2 max-w-[22ch] lg:max-w-[26ch]">
          {techSection.title}
        </h2>

        <div className="coupon mt-8 lg:mt-12">
          <div className="flex items-center justify-between gap-4 rounded-t-[2px] border-b-2 border-ink px-5 py-3 sm:px-8">
            <span className="!text-xs t-field">Fiche technique</span>
            <span className="!text-xs t-field t-num">
              {techSection.stack.length} composants
            </span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
            <div className="p-5 sm:p-8 lg:p-10">
              <p className="!text-xs t-field">Méthode</p>
              <p className="mt-3 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
                {techSection.methodSummary}
              </p>
            </div>

            <div className="border-t-2 border-dashed border-ink bg-[#f6f5fb] p-5 sm:p-8 lg:rounded-br-[2px] lg:border-l-2 lg:border-t-0 lg:p-10">
              <p className="!text-xs t-field">Stack technique</p>
              <ul className="mt-3 flex flex-wrap content-start gap-2.5">
                {techSection.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-[3px] border-2 border-ink bg-panel px-3 py-1.5 text-sm font-semibold leading-snug text-ink transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
