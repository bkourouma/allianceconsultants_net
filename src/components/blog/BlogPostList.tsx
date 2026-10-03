import { BlogFeatured } from "./BlogFeatured";
import { BlogIndexCard, type BlogListPost } from "./BlogIndexCard";

/**
 * Editorial listing: on the first page the latest article is featured large,
 * the rest runs as rows alternating between a larger and a smaller treatment.
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
        <ul className="border-b border-ink/15">
          {rows.map((p, i) => (
            <li key={p.id}>
              <BlogIndexCard post={p} emphasis={i % 2 === 0 ? "lg" : "sm"} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
