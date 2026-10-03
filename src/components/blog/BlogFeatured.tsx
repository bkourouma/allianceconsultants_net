import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { lineStyle } from "@/lib/network";
import { BlogTagBadge } from "./BlogTagBadge";
import type { BlogListPost } from "./BlogIndexCard";
import { PostCover } from "./PostCover";
import { PostMeta } from "./PostMeta";
import { frTypo, postLineId } from "./post-utils";

/** The latest article, presented large: cover (photo or generated route) + display title. */
export function BlogFeatured({ post }: { post: BlogListPost }) {
  return (
    <article
      style={lineStyle(postLineId(post.slug))}
      className="group relative grid items-center gap-6 lg:grid-cols-12 lg:gap-12"
    >
      <PostCover
        slug={post.slug}
        coverUrl={post.coverUrl}
        coverAlt={post.coverAlt}
        title={post.title}
        tone="night"
        priority
        sizes="(min-width:1280px) 700px, (min-width:1024px) 58vw, 100vw"
        className="aspect-[16/10] lg:col-span-7"
      />

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
        {post.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <li key={t.slug} className="relative z-10">
                <BlogTagBadge tag={t} />
              </li>
            ))}
          </ul>
        ) : null}

        <h2 className="font-display text-balance text-[clamp(1.875rem,1.3rem+2.4vw,3.25rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
          <Link
            href={`/blog/${post.slug}`}
            className="underline decoration-transparent decoration-4 underline-offset-[0.14em] transition-[text-decoration-color] duration-300 after:absolute after:inset-0 after:content-[''] group-hover:decoration-[var(--accent)]"
          >
            {frTypo(post.title)}
          </Link>
        </h2>

        <p className="t-lead line-clamp-4">{post.excerpt}</p>

        <PostMeta date={post.publishedAt} readingMinutes={post.readingMinutes} />

        <span
          aria-hidden
          className="mt-2 inline-flex h-11 w-fit items-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-[0.9375rem] font-bold text-white transition-colors duration-300 group-hover:bg-night-2"
        >
          Lire l&apos;article
          <span className="grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5">
            <ArrowRight className="size-4" strokeWidth={2} />
          </span>
        </span>
      </div>
    </article>
  );
}
