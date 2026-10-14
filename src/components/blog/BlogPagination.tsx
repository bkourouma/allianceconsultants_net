import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[3px] border-2 border-ink px-3.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] no-underline transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)]";
const IDLE = "bg-panel text-ink hover:bg-ink hover:text-white";

/** Page numbers to show: first, last and a window around the current page. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  const keep = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/** Numbered pagination. `basePath` = "/blog" or "/blog/tags/<slug>". */
export function BlogPagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  const href = (p: number) => (p > 1 ? `${basePath}?page=${p}` : basePath);
  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4"
    >
      <p className="t-num font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink-soft">
        Page <strong className="font-semibold text-ink">{page}</strong> sur {totalPages}
      </p>
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <li>
            <Link href={href(page - 1)} rel="prev" className={cn(BASE, IDLE)}>
              <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
              Précédents
            </Link>
          </li>
        ) : null}
        {pageWindow(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="hidden px-1 font-mono text-ink-mute sm:block">
              …
            </li>
          ) : (
            <li key={p} className="hidden sm:block">
              <Link
                href={href(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(BASE, "t-num", p === page ? "bg-ink text-white" : IDLE)}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        {page < totalPages ? (
          <li>
            <Link href={href(page + 1)} rel="next" className={cn(BASE, IDLE)}>
              Suivants
              <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
