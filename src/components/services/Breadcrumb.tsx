import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

/** Fil d'Ariane — last item is the current page. */
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
          "flex flex-wrap items-center gap-x-1 gap-y-1 text-sm",
          onDark ? "text-white/80" : "text-ink-soft",
        )}
      >
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.label} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="inline-flex min-h-8 items-center rounded px-1 underline-offset-4 hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(
                    "px-1 font-semibold",
                    onDark ? "text-white" : "text-ink",
                  )}
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <ChevronRight aria-hidden className="size-4 opacity-60" strokeWidth={1.75} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
