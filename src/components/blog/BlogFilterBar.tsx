import Link from "next/link";
import { Rss } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogTagBadge } from "./BlogTagBadge";

/** Tag filter chips (links to /blog/tags/<slug>) + RSS. */
export function BlogFilterBar({
  tags,
  activeSlug,
}: {
  tags: { slug: string; label: string; count?: number }[];
  activeSlug?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <nav
        aria-label="Filtrer par thème"
        className="-mx-[clamp(1rem,4vw,2.5rem)] min-w-0 max-w-[100vw] overflow-x-auto px-[clamp(1rem,4vw,2.5rem)] pb-1 [scrollbar-width:none] sm:mx-0 sm:max-w-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
          <li>
            <Link
              href="/blog"
              aria-current={!activeSlug ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold no-underline ring-1 transition-colors duration-200",
                !activeSlug
                  ? "bg-ink text-white ring-ink"
                  : "bg-panel text-ink ring-rule hover:ring-ink",
              )}
            >
              Tous
            </Link>
          </li>
          {tags.map((t) => (
            <li key={t.slug}>
              <BlogTagBadge tag={t} size="md" active={activeSlug === t.slug} />
            </li>
          ))}
        </ul>
      </nav>
      <Link
        href="/feed.xml"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-4"
      >
        <Rss aria-hidden className="size-4" strokeWidth={2} />
        Flux RSS
      </Link>
    </div>
  );
}
