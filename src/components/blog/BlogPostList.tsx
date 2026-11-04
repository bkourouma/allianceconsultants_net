import { BlogFeatured } from "./BlogFeatured";
import { BlogIndexCard, type BlogListPost } from "./BlogIndexCard";

/**
 * Listing: on the first page the latest article is featured on a large
 * coupon, the rest runs as a list of slim coupons separated by whitespace.
 */
export function BlogPostList({
  items,
  featureFirst,
  readingMinutes,
}: {
  items: BlogListPost[];
  /** Feature the first item (page 1 only). */
  featureFirst: boolean;
  readingMinutes?: Record<string, number>;
}) {
  const enriched = items.map((p) => ({ ...p, readingMinutes: readingMinutes?.[p.id] }));
  const [first, ...rest] = enriched;
  const rows = featureFirst ? rest : enriched;

  return (
    <div>
      {featureFirst && first ? (
        <div className="pb-10 sm:pb-14">
          <BlogFeatured post={first} />
        </div>
      ) : null}

      {rows.length > 0 ? (
        <ul className="grid gap-4 sm:gap-5">
          {rows.map((p) => (
            <li key={p.id}>
              <BlogIndexCard post={p} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
