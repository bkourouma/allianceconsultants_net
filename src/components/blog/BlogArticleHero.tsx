import type { PublishedPostDetail } from "@/lib/blog";
import { BlogBreadcrumb } from "./BlogBreadcrumb";
import { BlogTagBadge } from "./BlogTagBadge";
import { PostCover } from "./PostCover";
import { PostMeta } from "./PostMeta";
import { frTypo } from "./post-utils";

/** Article header: breadcrumb, tag roundels, display title, lead, byline, cover. */
export function BlogArticleHero({
  post,
  readingMinutes,
}: {
  post: PublishedPostDetail;
  readingMinutes?: number;
}) {
  const initial = post.authorName?.trim().charAt(0).toUpperCase();
  return (
    <header className="wrap pb-10 pt-6 sm:pt-10 lg:pb-14">
      <BlogBreadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      {post.tags.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <li key={t.slug}>
              <BlogTagBadge tag={t} />
            </li>
          ))}
        </ul>
      ) : null}

      <h1 className="mt-5 max-w-4xl text-balance font-display text-[clamp(2.125rem,1.4rem+3.3vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
        {frTypo(post.title)}
      </h1>

      {post.excerpt ? <p className="t-lead mt-5">{post.excerpt}</p> : null}

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        {post.authorName ? (
          <p className="inline-flex items-center gap-3 text-[0.9375rem] font-bold text-ink">
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full bg-[var(--accent)] font-display text-sm font-extrabold text-[var(--on-accent)]"
            >
              {initial}
            </span>
            <span>
              <span className="sr-only">Auteur : </span>
              {post.authorName}
            </span>
          </p>
        ) : null}
        <PostMeta date={post.publishedAt} readingMinutes={readingMinutes} />
      </div>

      <PostCover
        slug={post.slug}
        coverUrl={post.coverUrl}
        coverAlt={post.coverAlt}
        title={post.title}
        tone="night"
        priority
        sizes="(min-width:1280px) 1200px, 100vw"
        className="mt-9 aspect-[2/1] sm:aspect-[21/9]"
      />
    </header>
  );
}
