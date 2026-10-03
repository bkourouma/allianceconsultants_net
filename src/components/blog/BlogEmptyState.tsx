import Link from "next/link";
import { ArrowLeft, Rss } from "lucide-react";

/** Empty listing: a line waiting for its first station. */
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
    <div className="grid items-center gap-8 rounded-[8px] bg-panel p-8 ring-1 ring-rule sm:p-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <h2 className="font-display text-balance text-3xl font-extrabold leading-[1.05] tracking-[-0.025em] text-ink sm:text-4xl">
          {title}
        </h2>
        {children ? <p className="t-body mt-3 text-ink-soft">{children}</p> : null}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {showRss ? (
            <Link
              href="/feed.xml"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-4"
            >
              <Rss aria-hidden className="size-4" strokeWidth={2} />
              S&apos;abonner au flux RSS
            </Link>
          ) : null}
          {backToAll ? (
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-4"
            >
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
              Tous les articles
            </Link>
          ) : null}
        </div>
      </div>

      {/* A line that has not reached its first station yet. */}
      <svg viewBox="0 0 320 120" aria-hidden="true" className="hidden h-auto w-full lg:block">
        <path d="M0 90H110L170 30H250" fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M250 30H320" fill="none" stroke="var(--color-rule)" strokeWidth="14" strokeDasharray="4 18" strokeLinecap="round" />
        <circle cx="110" cy="90" r="13" fill="#fff" stroke="#0b1b3a" strokeWidth="5" />
        <circle cx="250" cy="30" r="17" fill="#fff" stroke="#0b1b3a" strokeWidth="5" />
        <circle cx="250" cy="30" r="6" fill="var(--accent)" />
      </svg>
    </div>
  );
}
