import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublishedPostListItem } from "@/lib/blog";
import { BlogTagBadge } from "./BlogTagBadge";
import { formatPostDate, formatPostDateParts, frTypo } from "./post-utils";

export type BlogListPost = PublishedPostListItem & { readingMinutes?: number };

/**
 * Slim coupon: date stub on the left (carbon day numeral), title, excerpt and
 * tag chips in the middle, a detachable "lecture" stub on the right (from
 * `sm`). The whole coupon is one stretched link; tag chips stay clickable.
 */
export function BlogIndexCard({ post }: { post: BlogListPost }) {
  const d = formatPostDateParts(post.publishedAt);
  return (
    <article className="coupon group relative grid grid-cols-[4.5rem_minmax(0,1fr)] overflow-hidden motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-[var(--ease-out-expo)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] sm:grid-cols-[5.5rem_minmax(0,1fr)_9.5rem]">
      <time
        dateTime={post.publishedAt.toISOString()}
        aria-label={formatPostDate(post.publishedAt)}
        className="t-num relative flex flex-col items-center justify-center border-r-2 border-ink bg-enamel/70 px-2 py-4 text-center before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-ink before:content-['']"
      >
        <span aria-hidden className="carbon font-display text-[2.25rem] font-extrabold leading-none sm:text-[2.75rem]">
          {d.day}
        </span>
        <span aria-hidden className="mt-1 font-mono text-[0.625rem] font-medium uppercase tracking-[0.1em] text-ink-soft">
          {d.month}
        </span>
        <span aria-hidden className="font-mono text-[0.625rem] font-medium tracking-[0.06em] text-ink-mute">
          {d.year}
        </span>
      </time>

      <div className="flex min-w-0 flex-col justify-center gap-2 px-4 py-4 sm:px-6 sm:py-5">
        <h3 className="t-h3 text-ink">
          <Link
            href={`/blog/${post.slug}`}
            className="underline decoration-transparent decoration-[3px] underline-offset-[0.18em] transition-[text-decoration-color] duration-300 after:absolute after:inset-0 after:z-0 after:content-[''] group-hover:decoration-ink"
          >
            {frTypo(post.title)}
          </Link>
        </h3>

        {post.excerpt ? (
          <p className="t-body line-clamp-2 hidden text-[0.9375rem] leading-relaxed text-ink-soft sm:block">
            {post.excerpt}
          </p>
        ) : null}

        {post.tags.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-1.5 pt-1">
            {post.tags.slice(0, 3).map((t) => (
              <li key={t.slug} className="relative z-10">
                <BlogTagBadge tag={t} />
              </li>
            ))}
            {post.readingMinutes ? (
              <li className="t-num ml-1 text-[0.8125rem] text-ink-soft sm:hidden">
                {post.readingMinutes} min
              </li>
            ) : null}
          </ul>
        ) : post.readingMinutes ? (
          <p className="t-num text-[0.8125rem] text-ink-soft sm:hidden">{post.readingMinutes} min de lecture</p>
        ) : null}
      </div>

      <div
        aria-hidden
        className="coupon-stub hidden flex-col items-start justify-between gap-3 px-4 py-4 sm:flex"
      >
        <span className="t-field">Lecture</span>
        <span className="t-num font-display text-[1.375rem] font-bold leading-none text-ink">
          {post.readingMinutes ? `${post.readingMinutes} min` : "—"}
        </span>
        <span className="inline-flex size-8 items-center justify-center rounded-[3px] bg-ink text-white transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="size-4" strokeWidth={2.25} />
        </span>
      </div>
    </article>
  );
}
