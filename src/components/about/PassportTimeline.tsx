import { PressedStamp } from "./PressedStamp";

export interface Milestone {
  year: string;
  title: string;
  description: string;
  /** Small product colour chip next to the year. */
  color: string;
}

interface PassportTimelineProps {
  milestones: readonly Milestone[];
  label: string;
}

/**
 * The company story as a passport: the opening page carries the founding
 * (2003, the only year headlined, with its stamp), the following visas stay
 * small and modest on the facing page. One ordered list, readable without JS.
 */
export function PassportTimeline({ milestones, label }: PassportTimelineProps) {
  const [origin, ...visas] = milestones;
  if (!origin) return null;

  return (
    <div className="coupon overflow-hidden">
      <div className="flex items-center justify-between gap-4 bg-ink px-5 py-2.5 text-white sm:px-8">
        <p className="t-field !text-white">Passeport Alliance Consultants</p>
        <p className="t-field hidden !text-white/80 sm:block">Abidjan, Côte d&apos;Ivoire</p>
      </div>

      <ol
        aria-label={label}
        className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[repeat(var(--n),auto)]"
        style={{ "--n": Math.max(visas.length, 1) } as React.CSSProperties}
      >
        <li
          className="relative border-b-2 border-dashed border-ink px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:col-start-1 lg:border-b-0 lg:border-r-2 lg:[grid-row:1/span_var(--n)]"
        >
          <p className="t-field">Page d&apos;ouverture</p>
          <p className="t-num font-display text-[clamp(5.5rem,14vw,9.5rem)] font-extrabold italic leading-[0.85] tracking-[-0.02em] text-carbon">
            {origin.year}
          </p>
          <h3 className="t-h3 mt-5 max-w-[20ch] text-ink">{origin.title}</h3>
          <p className="mt-3 max-w-[38ch] text-[1.0625rem] leading-relaxed text-ink-soft">
            {origin.description}
          </p>
          <div className="mt-8 flex justify-end sm:mt-10 lg:absolute lg:bottom-9 lg:right-8 lg:mt-0">
            <PressedStamp trigger="view" size="1.375rem">
              Fondée à Abidjan
            </PressedStamp>
          </div>
        </li>

        {visas.map((m, i) => (
          <li
            key={m.year}
            className={
              "grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-4 px-5 py-5 sm:px-8 lg:col-start-2 lg:grid-cols-[5.25rem_minmax(0,1fr)] " +
              (i < visas.length - 1 ? "border-b border-dashed border-ink-mute/60" : "")
            }
          >
            <p className="flex items-start gap-2 pt-0.5">
              <span
                aria-hidden
                className="mt-[0.3rem] size-2.5 shrink-0 rounded-[2px]"
                style={{ background: m.color }}
              />
              <span className="t-num font-mono text-[0.8125rem] font-semibold tracking-[0.04em] text-ink-soft">
                {m.year}
              </span>
            </p>
            <div>
              <h3 className="font-display text-[1.1875rem] font-bold leading-tight text-ink">
                {m.title}
              </h3>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                {m.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
