import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPostDate } from "./post-utils";

/** Date + reading time, tabular numerals. */
export function PostMeta({
  date,
  readingMinutes,
  className,
}: {
  date: Date;
  readingMinutes?: number;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "t-num flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-mute",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden className="size-4" strokeWidth={1.75} />
        <time dateTime={date.toISOString()}>{formatPostDate(date)}</time>
      </span>
      {readingMinutes ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" strokeWidth={1.75} />
          {readingMinutes} min de lecture
        </span>
      ) : null}
    </p>
  );
}
