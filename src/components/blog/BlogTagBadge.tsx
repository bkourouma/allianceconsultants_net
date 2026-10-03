import Link from "next/link";
import { cn } from "@/lib/utils";
import { tagLine } from "./post-utils";

/**
 * Tag roundel: a line-coloured roundel (initial) + label, like a line badge on
 * a station sign. Colour is deterministic from the tag slug.
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
  const initial = tag.label.trim().charAt(0).toUpperCase() || "#";
  return (
    <Link
      href={`/blog/tags/${encodeURIComponent(tag.slug)}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full font-semibold no-underline ring-1 transition-colors duration-200",
        size === "md" ? "min-h-11 py-1.5 pl-1.5 pr-4 text-sm" : "min-h-8 py-1 pl-1 pr-3 text-[0.8125rem]",
        active
          ? "bg-ink text-white ring-ink"
          : "bg-panel text-ink ring-rule hover:ring-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center rounded-full font-extrabold",
          size === "md" ? "size-8 text-xs" : "size-6 text-[11px]",
        )}
        style={{ background: line.color, color: line.onColor }}
      >
        {initial}
      </span>
      {tag.label}
      {typeof tag.count === "number" ? (
        <span
          className={cn(
            "t-num text-xs font-medium",
            active ? "text-white/75" : "text-ink-mute",
          )}
        >
          {tag.count}
        </span>
      ) : null}
    </Link>
  );
}
