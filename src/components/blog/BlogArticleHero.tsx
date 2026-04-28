import Image from "next/image";
import Link from "next/link";
import type { PublishedPostDetail } from "@/lib/blog";
import { BlogTagBadge } from "./BlogTagBadge";

export function BlogArticleHero({ post }: { post: PublishedPostDetail }) {
  return (
    <header className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 90% 0%, rgba(59,130,246,0.18), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-primary">
                Accueil
              </Link>
            </li>
            <li aria-hidden className="text-slate-300">/</li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <li aria-hidden className="text-slate-300">/</li>
            <li className="font-medium text-slate-700 line-clamp-1">{post.title}</li>
          </ol>
        </nav>

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <BlogTagBadge key={t.slug} tag={t} />
            ))}
          </div>
        ) : null}

        <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <time dateTime={post.publishedAt.toISOString()}>
            Publié le{" "}
            {post.publishedAt.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.authorName ? <span>· par {post.authorName}</span> : null}
        </div>

        {post.coverUrl ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <Image
              src={post.coverUrl}
              alt={post.coverAlt ?? post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
