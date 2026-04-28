import Link from "next/link";
import type { PublishedPostListItem } from "@/lib/blog";
import { BlogTagBadge } from "./BlogTagBadge";

export function BlogIndexCard({ post }: { post: PublishedPostListItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {post.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverUrl}
          alt={post.coverAlt ?? ""}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          aria-hidden
          className="aspect-[16/9] w-full bg-gradient-to-br from-primary/10 via-slate-50 to-slate-100"
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <BlogTagBadge key={t.slug} tag={t} />
            ))}
          </div>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-primary">
          <Link href={`/blog/${post.slug}`} className="focus-visible:outline-none focus-visible:underline">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <time dateTime={post.publishedAt.toISOString()}>
            {post.publishedAt.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.authorName ? <span>{post.authorName}</span> : null}
        </div>
      </div>
    </article>
  );
}
