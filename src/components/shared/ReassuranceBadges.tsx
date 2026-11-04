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

/** A ruled line of validated facts: navy rule, mono caps, small navy marks. */
export function ReassuranceBadges({ facts = VALIDATED_FACTS, className }: ReassuranceBadgesProps) {
  return (
    <ul
      className={cn(
        "m-0 flex list-none flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t-2 border-ink p-0 pt-3.5 font-mono text-xs font-medium uppercase tracking-[0.05em] text-ink",
        className,
      )}
      aria-label="Points de repère Alliance Consultants"
    >
      {facts.slice(0, 4).map((fact) => (
        <li key={fact} className="inline-flex items-center gap-2 whitespace-nowrap">
          <span aria-hidden className="inline-block size-1.5 shrink-0 rounded-full bg-ink" />
          {fact}
        </li>
      ))}
    </ul>
  );
}
