import Link from "next/link";
import { ArrowLeft, Rss } from "lucide-react";

const LINK =
  "inline-flex min-h-11 items-center gap-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink underline decoration-red decoration-2 underline-offset-[6px] hover:decoration-4";

/**
 * Empty listing: a blank coupon, fields still empty. The rubber stamp only
 * appears for the main index ("à paraître"); a tag with no article stays calm.
 */
export function BlogEmptyState({
  title,
  children,
  showRss = true,
  backToAll = false,
}: {
  title: string;
  children?: React.ReactNode;
  showRss?: boolean;
  backToAll?: boolean;
}) {
  return (
    <div className="coupon grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="p-6 sm:p-10">
        <h2 className="t-h2 text-ink">{title}</h2>
        {children ? <p className="t-lead mt-4">{children}</p> : null}
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1">
          {showRss ? (
            <Link href="/feed.xml" className={LINK}>
              <Rss aria-hidden className="size-4" strokeWidth={2} />
              S&apos;abonner au flux RSS
            </Link>
          ) : null}
          {backToAll ? (
            <Link href="/blog" className={LINK}>
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
              Tous les articles
            </Link>
          ) : null}
        </div>
      </div>

      <div
        aria-hidden
        className="relative hidden flex-col justify-center gap-3 border-l-2 border-dashed border-ink bg-enamel/60 px-6 lg:flex"
      >
        <span className="h-2.5 w-4/5 rounded-[2px] bg-rule" />
        <span className="h-2.5 w-3/5 rounded-[2px] bg-rule" />
        <span className="h-2.5 w-2/3 rounded-[2px] bg-rule" />
        {showRss ? (
          <span className="stamp absolute bottom-6 right-5 bg-panel/80 text-[0.75rem]!">
            À paraître
          </span>
        ) : null}
      </div>
    </div>
  );
}
