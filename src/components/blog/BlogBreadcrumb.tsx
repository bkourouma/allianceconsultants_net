import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function BlogBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ink-mute">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {it.href && !last ? (
                <Link
                  href={it.href}
                  className="inline-flex min-h-8 items-center underline decoration-rule decoration-2 underline-offset-4 hover:text-ink hover:decoration-ink"
                >
                  {it.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="line-clamp-1 font-semibold text-ink"
                >
                  {it.label}
                </span>
              )}
              {!last ? (
                <ChevronRight aria-hidden className="size-4 shrink-0 text-ink-mute" strokeWidth={1.75} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
