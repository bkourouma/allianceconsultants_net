import { cn } from "@/lib/utils";

/** The only facts we can stand behind (PRODUCT.md): nothing else is shown. */
export const VALIDATED_FACTS = [
  "Depuis 2003",
  "Abidjan, Côte d'Ivoire",
  "Afrique francophone",
  "Support local",
] as const;

interface ReassuranceBadgesProps {
  /**
   * Legacy prop (homepage.mdx `hero.reassuranceBadges`). Kept so existing
   * callers compile, but ignored: unvalidated claims are never rendered.
   */
  badges?: string[];
  /** Override the validated list (max 4 are shown). */
  facts?: readonly string[];
  className?: string;
}

/** A quiet single-line list of validated facts, separated by station dots. */
export function ReassuranceBadges({ facts = VALIDATED_FACTS, className }: ReassuranceBadgesProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] font-semibold text-ink-soft sm:text-[0.875rem]",
        className,
      )}
      aria-label="Points de repère Alliance Consultants"
    >
      {facts.slice(0, 4).map((fact) => (
        <li key={fact} className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-2.5 shrink-0 rounded-full border-[2.5px] border-ink bg-panel"
          />
          {fact}
        </li>
      ))}
    </ul>
  );
}
