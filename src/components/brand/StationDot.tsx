import { cn } from "@/lib/utils";

interface StationDotProps {
  /** Interchange = white ring with ink border (like a metro correspondence). */
  interchange?: boolean;
  className?: string;
}

/** A station marker. Colour comes from the surrounding --accent. */
export function StationDot({ interchange, className }: StationDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-3.5 shrink-0 rounded-full border-[3px]",
        interchange
          ? "border-ink bg-panel"
          : "border-[var(--accent)] bg-panel",
        className,
      )}
    />
  );
}
