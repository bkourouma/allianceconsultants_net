import { cn } from "@/lib/utils";
import { getLine } from "@/lib/network";

interface LineChipProps {
  /** LineId or solution slug. */
  line: string;
  label?: string;
  className?: string;
}

/** Roundel + name, like a line badge on a station sign. */
export function LineChip({ line, label, className }: LineChipProps) {
  const l = getLine(line);
  if (!l) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-panel py-1 pl-1 pr-3 text-sm font-semibold text-ink ring-1 ring-rule",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-6 place-items-center rounded-full text-[11px] font-extrabold"
        style={{ background: l.color, color: l.onColor }}
      >
        {l.glyph}
      </span>
      {label ?? l.name}
    </span>
  );
}
