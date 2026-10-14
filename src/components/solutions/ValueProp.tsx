interface ValuePropProps {
  text: string;
  /** Optional heading; defaults to a neutral one. */
  title?: string;
}

/** The value statement, set on one coupon beside its heading. */
export function ValueProp({ text, title = "La valeur en clair" }: ValuePropProps) {
  return (
    <section
      id="proposition-de-valeur"
      aria-labelledby="valeur-title"
      className="py-16 lg:py-24"
    >
      <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <h2 id="valeur-title" className="t-h2 text-ink">
          {title}
        </h2>
        <div className="coupon">
          <div className="flex items-center gap-3 px-6 py-3.5 sm:px-8">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-[2px] bg-[var(--accent)] ring-1 ring-ink"
            />
            <p className="t-field">Proposition de valeur</p>
          </div>
          <hr className="tear" />
          <p className="px-6 py-7 text-pretty text-[clamp(1.1875rem,1.02rem+0.8vw,1.625rem)] font-medium leading-[1.4] text-ink sm:px-8 sm:py-9">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}
