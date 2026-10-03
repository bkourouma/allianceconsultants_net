import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLine, type LineId } from "@/lib/network";
import { LINE_GLYPH } from "./serviceMap";

/** Coloured roundel for a solution line, optionally a link to its page. */
export function LineRoundel({
  line,
  size = "md",
  href = true,
  className,
}: {
  line: LineId;
  size?: "sm" | "md" | "lg";
  href?: boolean;
  className?: string;
}) {
  const l = getLine(line);
  if (!l) return null;
  const dims = {
    sm: "size-8 text-[13px]",
    md: "size-10 text-base",
    lg: "size-14 text-2xl",
  }[size];
  const cls = cn(
    "relative grid shrink-0 place-items-center rounded-full font-display font-extrabold ring-2 ring-panel transition-transform duration-300 ease-[var(--ease-out-expo)]",
    // enlarge the hit area to >= 44px without changing the visual size
    "after:absolute after:-inset-1.5 after:content-['']",
    href && "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
    dims,
    className,
  );
  const style = { background: l.color, color: l.onColor };
  const glyph = <span aria-hidden>{LINE_GLYPH[line]}</span>;
  if (!href) {
    return (
      <span className={cls} style={style} title={l.name}>
        {glyph}
        <span className="sr-only">{l.name}</span>
      </span>
    );
  }
  return (
    <Link href={`/solutions/${l.slug}`} className={cls} style={style} title={l.name}>
      {glyph}
      <span className="sr-only">{l.name}</span>
    </Link>
  );
}
