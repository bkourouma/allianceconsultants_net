import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { lineStyle } from "@/lib/network";
import { BlogTagBadge } from "./BlogTagBadge";
import type { BlogListPost } from "./BlogIndexCard";
import { PostCover } from "./PostCover";
import { formatPostDate, frTypo, postLineId } from "./post-utils";

/**
 * The latest article, on a large coupon: navy header band with the date tab,
 * cover on the left (photo or generated coupon cover), title and excerpt on
 * the right, a perforation and the "read" stub at the bottom. The whole
 * coupon is one stretched link; tag chips stay independently clickable.
 */
export function BlogFeatured({ post }: { post: BlogListPost }) {
  return (
    <article
      style={lineStyle(postLineId(post.slug))}
      className="coupon group relative overflow-hidden motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-[var(--ease-out-expo)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)]"
    >
      <div className="flex h-11 items-stretch bg-ink text-white">
        <span className="flex flex-1 items-center px-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em]">
          Dernier article
        </span>
        <span className="t-num grid place-items-center bg-[var(--accent)] px-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--on-accent)] sm:px-6">
          <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <PostCover
          slug={post.slug}
          coverUrl={post.coverUrl}
          coverAlt={post.coverAlt}
          title={post.title}
          priority
          sizes="(min-width:1280px) 640px, (min-width:1024px) 52vw, 100vw"
          className="aspect-[16/10] border-b-2 border-ink lg:aspect-auto lg:min-h-[23rem] lg:border-b-0 lg:border-r-2"
        />

        <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-8 lg:p-10">
          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((t) => (
                <li key={t.slug} className="relative z-10">
                  <BlogTagBadge tag={t} />
                </li>
              ))}
            </ul>
          ) : null}

          <h2 className="t-h2 text-ink">
            <Link
              href={`/blog/${post.slug}`}
              className="underline decoration-transparent decoration-4 underline-offset-[0.12em] transition-[text-decoration-color] duration-300 after:absolute after:inset-0 after:z-0 after:content-[''] group-hover:decoration-ink"
            >
              {frTypo(post.title)}
            </Link>
          </h2>

          <p className="t-lead line-clamp-4">{post.excerpt}</p>

          <div className="mt-auto pt-2">
            <hr className="tear" />
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-4">
              {post.readingMinutes ? (
                <p className="t-num inline-flex items-center gap-1.5 text-sm text-ink-soft">
                  <Clock aria-hidden className="size-4" strokeWidth={1.75} />
                  {post.readingMinutes} min de lecture
                </p>
              ) : (
                <span />
              )}
              <span
                aria-hidden
                className="inline-flex h-11 items-center gap-2.5 rounded-[3px] bg-ink px-5 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-white shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-y-[-1px]"
              >
                Lire l&apos;article
                <ArrowRight className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5" strokeWidth={2.25} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
