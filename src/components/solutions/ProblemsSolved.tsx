interface ProblemsSolvedProps {
  items: string[];
}

/** Problems solved: one coupon, one perforated row per problem. */
export function ProblemsSolved({ items }: ProblemsSolvedProps) {
  return (
    <section
      id="problemes"
      aria-labelledby="problemes-title"
      className="pb-16 lg:pb-24"
    >
      <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <h2 id="problemes-title" className="t-h2 text-ink">
          Problèmes résolus
        </h2>
        <ol className="coupon">
          {items.map((p, i) => (
            <li
              key={p}
              className="relative grid gap-x-5 gap-y-1 px-6 py-5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:px-8 sm:py-6"
            >
              {i > 0 && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 border-t-2 border-dashed border-ink"
                />
              )}
              <span className="t-field pt-1">Problème {i + 1}</span>
              <p className="t-body text-[1.0625rem] leading-relaxed text-ink">
                {p}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
