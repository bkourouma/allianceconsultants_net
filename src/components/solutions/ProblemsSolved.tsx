import { Section } from "@/components/ui/Section";

interface ProblemsSolvedProps {
  items: string[];
}

/** Problems solved, drawn as a route: one line-coloured spine, one station each. */
export function ProblemsSolved({ items }: ProblemsSolvedProps) {
  return (
    <Section id="problemes" bg="gray" padding="sm" aria-labelledby="problemes-title">
      <div className="rounded-md bg-panel p-6 sm:p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="problemes-title" className="t-h2 max-w-[14ch] text-ink">
            Problèmes résolus
          </h2>
          <ol className="relative">
            <span
              aria-hidden
              className="absolute bottom-4 left-[9px] top-4 w-1.5 bg-[var(--accent)]"
            />
            {items.map((p) => (
              <li key={p} className="relative py-3 pl-12 sm:pl-14">
                <span
                  aria-hidden
                  className="absolute left-0 top-[1.0625rem] size-6 rounded-full border-[5px] border-[var(--accent)] bg-panel"
                />
                <p className="t-body text-[1.0625rem] leading-relaxed text-ink sm:text-lg">
                  {p}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
