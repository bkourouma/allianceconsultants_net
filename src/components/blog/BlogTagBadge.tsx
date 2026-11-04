import Link from "next/link";
import { cn } from "@/lib/utils";
import { tagLine } from "./post-utils";

/**
 * Tag chip: a mono field caption with a small product-colour tab. The colour
 * is deterministic from the tag slug. Links to /blog/tags/<slug>.
 */
export function BlogTagBadge({
  tag,
  active = false,
  size = "sm",
  className,
}: {
  tag: { slug: string; label: string; count?: number };
  active?: boolean;
  /** "md" = filter chip (44px touch target), "sm" = inline tag. */
  size?: "sm" | "md";
  className?: string;
}) {
  const line = tagLine(tag.slug);
  return (
    <Link
      href={`/blog/tags/${encodeURIComponent(tag.slug)}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-[3px] border-2 border-ink font-mono font-medium uppercase tracking-[0.08em] no-underline transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)]",
        size === "md"
          ? "min-h-11 px-3.5 text-[0.75rem]"
          : "min-h-8 px-2 text-[0.6875rem] before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']",
        active ? "bg-ink text-white" : "bg-panel text-ink hover:bg-ink hover:text-white",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ background: line.color }}
      />
      {tag.label}
      {typeof tag.count === "number" ? (
        <span className={cn("t-num font-medium", active ? "text-white/80" : "text-ink-mute")}>
          {tag.count}
        </span>
      ) : null}
    </Link>
  );
}
