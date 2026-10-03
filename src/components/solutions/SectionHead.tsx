import { cn } from "@/lib/utils";

interface SectionHeadProps {
  title: string;
  id?: string;
  intro?: string;
  /** Rule + title colours for dark grounds. */
  onDark?: boolean;
  className?: string;
}

/** Section opener: a station on a hairline, then the heading. */
export function SectionHead({
  title,
  id,
  intro,
  onDark = false,
  className,
}: SectionHeadProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <div aria-hidden className="flex items-center gap-4">
        <span
          className={cn(
            "size-6 shrink-0 rounded-full border-[5px] border-[var(--accent)]",
            onDark ? "bg-night" : "bg-panel",
          )}
        />
        <span
          className={cn("h-px w-24", onDark ? "bg-white/30" : "bg-ink/30")}
        />
      </div>
      <h2
        id={id}
        className={cn("t-h2 mt-5", onDark ? "text-white" : "text-ink")}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "t-lead mt-4",
            onDark && "!text-white/80",
          )}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
