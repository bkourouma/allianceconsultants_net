import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { lineStyle } from "@/lib/network";
import type { PublishedPostListItem } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { BlogTagBadge } from "./BlogTagBadge";
import { PostCover } from "./PostCover";
import { PostMeta } from "./PostMeta";
import { frTypo, postLineId } from "./post-utils";

export type BlogListPost = PublishedPostListItem & { readingMinutes?: number };

/**
 * Editorial row (not a card): hairline rule above, cover left, text right.
 * `emphasis="lg"` = big cover + display title + excerpt; `"sm"` = compact
 * thumbnail row. The whole row is one stretched link; tag roundels stay
 * independently clickable.
 */
export function BlogIndexCard({
  post,
  emphasis = "sm",
}: {
  post: BlogListPost;
  emphasis?: "lg" | "sm";
}) {
  const large = emphasis === "lg";
  return (
    <article
      style={lineStyle(postLineId(post.slug))}
      className={cn(
        "group relative grid items-start gap-x-6 gap-y-4 border-t border-ink/15 py-7 sm:py-9",
        large
          ? "grid-cols-1 sm:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-x-10"
          : "grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-10",
      )}
    >
      <PostCover
        slug={post.slug}
        coverUrl={post.coverUrl}
        coverAlt={post.coverAlt}
        title={post.title}
        sizes={large ? "(min-width:1024px) 384px, (min-width:640px) 240px, 100vw" : "(min-width:640px) 176px, 88px"}
        className={cn(
          large ? "aspect-[16/9] sm:aspect-[4/3] lg:aspect-[16/10]" : "aspect-square sm:aspect-[4/3]",
        )}
      />

      <div className="flex min-w-0 flex-col gap-3">
        {post.tags.length > 0 ? (
          <ul className={cn("flex-wrap gap-1.5", large ? "flex" : "hidden sm:flex")}>
            {post.tags.slice(0, 3).map((t) => (
              <li key={t.slug} className="relative z-10">
                <BlogTagBadge tag={t} />
              </li>
            ))}
          </ul>
        ) : null}

        <h3
          className={cn(
            "font-display text-balance text-ink",
            large
              ? "text-[clamp(1.5rem,1.15rem+1.1vw,2.125rem)] font-extrabold leading-[1.08] tracking-[-0.025em]"
              : "text-[clamp(1.0625rem,1rem+0.35vw,1.3125rem)] font-bold leading-[1.18] tracking-[-0.015em]",
          )}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="underline decoration-transparent decoration-[3px] underline-offset-[0.2em] transition-[text-decoration-color] duration-300 after:absolute after:inset-0 after:content-[''] group-hover:decoration-[var(--accent)]"
          >
            {frTypo(post.title)}
          </Link>
        </h3>

        {large || post.excerpt ? (
          <p
            className={cn(
              "t-body text-ink-soft",
              large ? "line-clamp-3 text-base leading-relaxed" : "line-clamp-2 hidden text-[0.9375rem] leading-relaxed sm:block",
            )}
          >
            {post.excerpt}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <PostMeta date={post.publishedAt} readingMinutes={post.readingMinutes} />
          {large ? (
            <span
              aria-hidden
              className="hidden size-9 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:grid"
            >
              <ArrowUpRight className="size-[18px]" strokeWidth={2} />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
