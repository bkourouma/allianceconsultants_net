import { cn } from "@/lib/utils";

interface SectionHeadProps {
  title: string;
  id?: string;
  intro?: string;
  className?: string;
}

/** Section opener: a plain heading (no kicker), optionally a lead. */
export function SectionHead({ title, id, intro, className }: SectionHeadProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <h2 id={id} className="t-h2 text-ink">
        {title}
      </h2>
      {intro && <p className="t-lead mt-4">{intro}</p>}
    </header>
  );
}
