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
        className="-mx-[clamp(1rem,4vw,2.5rem)] min-w-0 max-w-[100vw] overflow-x-auto px-[clamp(1rem,4vw,2.5rem)] py-1 [scrollbar-width:none] sm:mx-0 sm:max-w-none sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
          <li>
            <Link
              href="/blog"
              aria-current={!activeSlug ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[3px] border-2 border-ink px-3.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] no-underline transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)]",
                !activeSlug ? "bg-ink text-white" : "bg-panel text-ink hover:bg-ink hover:text-white",
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
        className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] text-ink underline decoration-red decoration-2 underline-offset-[6px] hover:decoration-4"
      >
        <Rss aria-hidden className="size-4" strokeWidth={2} />
        Flux RSS
      </Link>
    </div>
  );
}
