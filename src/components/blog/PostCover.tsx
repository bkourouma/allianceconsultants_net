import Image from "next/image";
import { cn } from "@/lib/utils";
import { RouteCover } from "./RouteCover";

interface PostCoverProps {
  slug: string;
  coverUrl: string | null;
  coverAlt?: string | null;
  /** Fallback alt for photographic covers. */
  title: string;
  tone?: "night" | "panel" | "enamel";
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Cover frame: the real image through next/image when present, otherwise the
 * authored route cover derived from the slug. The parent sets the aspect ratio.
 */
export function PostCover({
  slug,
  coverUrl,
  coverAlt,
  title,
  tone = "panel",
  sizes,
  priority,
  className,
}: PostCoverProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[8px] bg-panel ring-1 ring-rule",
        className,
      )}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={coverAlt ?? title}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!coverUrl.startsWith("/")}
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
      ) : (
        <RouteCover
          slug={slug}
          tone={tone}
          className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}
