import Image from "next/image";
import { cn } from "@/lib/utils";
import { CouponCover, type CouponCoverTone } from "./CouponCover";

interface PostCoverProps {
  slug: string;
  coverUrl: string | null;
  coverAlt?: string | null;
  /** Fallback alt for photographic covers. */
  title: string;
  tone?: CouponCoverTone | "auto";
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Cover frame: the real image through next/image when present, otherwise the
 * authored coupon cover derived from the slug. The parent sets the size; the
 * border and radius belong to the coupon that holds the cover.
 */
export function PostCover({
  slug,
  coverUrl,
  coverAlt,
  title,
  tone = "auto",
  sizes,
  priority,
  className,
}: PostCoverProps) {
  const motion =
    "motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-[1.03]";
  return (
    <div className={cn("relative isolate overflow-hidden bg-enamel", className)}>
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={coverAlt ?? title}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!coverUrl.startsWith("/")}
          className={cn("object-cover", motion)}
        />
      ) : (
        <CouponCover slug={slug} tone={tone} className={cn("absolute inset-0", motion)} />
      )}
    </div>
  );
}
