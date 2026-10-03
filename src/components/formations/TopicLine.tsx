import { cn } from "@/lib/utils";

/** Vertical violet line with a station for each topic (server component). */
export function TopicLine({ topics }: { topics: string[] }) {
  return (
    <ol className="relative">
      {topics.map((t, i) => (
        <li key={t} className="relative min-h-16 pb-4 pl-12 last:pb-0">
          <span
            aria-hidden
            className={cn(
              "absolute left-[11px] w-1.5 bg-[var(--accent)]",
              i === 0
                ? "bottom-0 top-[18px]"
                : i === topics.length - 1
                  ? "top-0 h-[18px]"
                  : "inset-y-0",
            )}
          />
          <span
            aria-hidden
            className="absolute left-0 top-1.5 size-7 rounded-full border-[6px] border-[var(--accent)] bg-panel ring-4 ring-enamel"
          />
          <span className="block pt-1 font-display text-xl font-semibold leading-snug tracking-tight text-ink">
            {t}
          </span>
        </li>
      ))}
    </ol>
  );
}
