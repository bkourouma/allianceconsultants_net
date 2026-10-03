import { cn } from "@/lib/utils";

export interface Milestone {
  year: string;
  title: string;
  description: string;
  /** Station ring colour. */
  color: string;
}

interface HistoryLineProps {
  milestones: readonly Milestone[];
}

/**
 * The company story drawn as a single line. Vertical on phones, horizontal
 * from lg up (all stations fit the container — no horizontal scrolling).
 * The first station (the creation, 2003) is the origin; the rest stay modest.
 */
export function HistoryLine({ milestones }: HistoryLineProps) {
  return (
    <ol className="relative grid gap-8 lg:grid-flow-col lg:auto-cols-fr lg:gap-6">
      {/* the line itself */}
      <span
        aria-hidden
        className="absolute bottom-3 left-[0.6875rem] top-3 w-1.5 rounded-full bg-ink lg:bottom-auto lg:left-3 lg:right-3 lg:top-[0.6875rem] lg:h-1.5 lg:w-auto"
      />
      {milestones.map((m, i) => {
        const origin = i === 0;
        return (
          <li
            key={m.year}
            className="relative pl-12 lg:pl-0 lg:pt-12"
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-0 block rounded-full border-[5px] bg-panel",
                origin ? "size-7 border-ink" : "size-7",
              )}
              style={origin ? undefined : { borderColor: m.color }}
            />
            <p
              className={cn(
                "t-num font-display font-extrabold leading-none tracking-tight text-ink",
                origin ? "text-4xl lg:text-5xl" : "text-lg text-ink-soft",
              )}
            >
              {m.year}
            </p>
            <h3
              className={cn(
                "mt-2 font-display font-bold leading-snug tracking-tight text-ink",
                origin ? "text-xl" : "text-base",
              )}
            >
              {m.title}
            </h3>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed text-ink-soft",
                origin && "lg:max-w-[15rem]",
              )}
            >
              {m.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
