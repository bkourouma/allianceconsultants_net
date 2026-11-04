import type { PublishedPostDetail } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { BlogBreadcrumb } from "./BlogBreadcrumb";
import { BlogTagBadge } from "./BlogTagBadge";
import { PostCover } from "./PostCover";
import { formatPostDate, frTypo } from "./post-utils";

const SM_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

const DAY = 24 * 60 * 60 * 1000;

/**
 * Article header: breadcrumb, tag chips, display title, lead, a ruled data
 * strip (author, dates, reading time) and, only when the article has a real
 * cover image, that image on a coupon frame. No generated cover here: the
 * reader is about to read, the page stays calm.
 */
export function BlogArticleHero({
  post,
  readingMinutes,
}: {
  post: PublishedPostDetail;
  readingMinutes?: number;
}) {
  const updated = post.updatedAt.getTime() - post.publishedAt.getTime() > DAY;
  const fields: { label: string; node: React.ReactNode }[] = [];
  if (post.authorName) fields.push({ label: "Auteur", node: post.authorName });
  fields.push({
    label: "Publié le",
    node: <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>,
  });
  if (updated) {
    fields.push({
      label: "Mis à jour le",
      node: <time dateTime={post.updatedAt.toISOString()}>{formatPostDate(post.updatedAt)}</time>,
    });
  }
  if (readingMinutes) fields.push({ label: "Lecture", node: `${readingMinutes} min` });

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

      <h1 className="t-display mt-5 max-w-[22ch] text-ink [font-size:clamp(2.375rem,1.5rem+3.6vw,4.5rem)]!">
        {frTypo(post.title)}
      </h1>

      {post.excerpt ? <p className="t-lead mt-6">{post.excerpt}</p> : null}

      <dl
        className={
          "coupon t-num mt-8 grid max-w-4xl grid-cols-2 overflow-hidden " +
          (SM_COLS[fields.length] ?? "sm:grid-cols-4")
        }
      >
        {fields.map((f, i) => (
          <div
            key={f.label}
            className={cn(
              "min-w-0 px-4 py-3 sm:px-5",
              i % 2 === 1 && "border-l-2 border-dashed border-ink",
              i >= 2 && "border-t-2 border-dashed border-ink",
              i > 0 && "sm:border-l-2 sm:border-t-0",
              i === 0 && "sm:border-l-0",
              fields.length % 2 === 1 && i === fields.length - 1 && fields.length > 1 && "col-span-2 border-l-0 sm:col-span-1 sm:border-l-2",
            )}
          >
            <dt className="t-field">{f.label}</dt>
            <dd className="mt-1 font-display text-[1.25rem] font-bold leading-tight text-ink sm:text-[1.375rem]">
              {f.node}
            </dd>
          </div>
        ))}
      </dl>

      {post.coverUrl ? (
        <div className="coupon mt-10 overflow-hidden">
          <PostCover
            slug={post.slug}
            coverUrl={post.coverUrl}
            coverAlt={post.coverAlt}
            title={post.title}
            priority
            sizes="(min-width:1280px) 1200px, 100vw"
            className="aspect-[16/9] sm:aspect-[21/9]"
          />
        </div>
      ) : null}
    </header>
  );
}
