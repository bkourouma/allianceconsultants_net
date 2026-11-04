import Link from "next/link";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

/** Fil d'Ariane — last item is the current page (truncated on narrow screens). */
export function Breadcrumb({
  items,
  onDark = false,
  className,
}: {
  items: Crumb[];
  onDark?: boolean;
  className?: string;
}) {
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol
        className={cn(
          "flex items-center gap-x-2 text-sm font-medium",
          onDark ? "text-white/80" : "text-ink-mute",
        )}
      >
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={c.label}
              className={cn("flex items-center gap-2", last ? "min-w-0" : "shrink-0")}
            >
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 hover:text-ink hover:decoration-current"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(
                    "block truncate font-bold",
                    onDark ? "text-white" : "text-ink",
                  )}
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <span aria-hidden className="opacity-60">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
