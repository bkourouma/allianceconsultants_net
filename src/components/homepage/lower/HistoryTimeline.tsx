import { cn } from "@/lib/utils";
import styles from "./Passport.module.css";

interface Milestone {
  year: number;
  label: string;
}

interface HistoryTimelineProps {
  history: Milestone[];
  className?: string;
}

/**
 * L'histoire d'Alliance en passeport : une page de visa par jalon.
 * L'année en grands chiffres carbone, un cachet d'entrée encre marine lisible,
 * une zone lisible par machine en pied de page. Entièrement statique.
 */
export function HistoryTimeline({ history, className }: HistoryTimelineProps) {
  if (history.length === 0) return null;

  return (
    <ol
      aria-label="Histoire d'Alliance Consultants"
      className={cn(
        "grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5",
        className,
      )}
    >
      {history.map((m, i) => (
        <li
          key={`${m.year}-${i}`}
          className={cn(styles.visa, "coupon relative flex min-h-[15rem] sm:min-h-[19rem] flex-col overflow-hidden")}
        >
          <div className="relative flex items-center justify-between border-b-2 border-ink px-5 py-2.5">
            <span className="!text-xs t-field">Visa d&apos;entrée</span>
            <span className="!text-xs t-field t-num" aria-hidden>
              p. {String(i + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="relative flex flex-1 flex-col px-5 pb-4 pt-5">
            <time
              dateTime={String(m.year)}
              className="t-num carbon block font-display text-[5rem] font-extrabold italic leading-[0.85] tracking-[-0.01em] xl:text-[4.5rem] 2xl:text-[5rem]"
            >
              {m.year}
            </time>
            <p className="relative z-10 mt-5 max-w-[24ch] flex-1 text-[1.0625rem] leading-snug text-ink">
              {m.label}
            </p>

            {/* Navy entry cachet, slightly off-register */}
            <span
              aria-hidden
              className={cn(
                styles.entry,
                i % 2 === 0 ? "-rotate-[5deg]" : "-rotate-[2deg]",
              )}
            >
              <span>Abidjan</span>
              <b>{m.year}</b>
              <span>Côte d&apos;Ivoire</span>
            </span>

            {/* Machine-readable zone */}
            <p
              aria-hidden
              className="mt-5 select-none overflow-hidden whitespace-nowrap font-mono text-xs leading-tight tracking-[0.12em] text-ink/60"
            >
              {`ALLIANCE<CONSULTANTS<<${m.year}<<<<<<<<<<`}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
