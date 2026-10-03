import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BTN =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-panel px-5 text-sm font-bold text-ink no-underline ring-1 ring-ink transition-colors duration-200 hover:bg-ink hover:text-white";

/** Prev/next pagination. `basePath` = "/blog" or "/blog/tags/<slug>". */
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
      className="mt-10 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="t-num text-sm text-ink-mute">
        Page <strong className="font-bold text-ink">{page}</strong> sur {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} rel="prev" className={BTN}>
            <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
            Précédents
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={href(page + 1)} rel="next" className={BTN}>
            Suivants
            <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
