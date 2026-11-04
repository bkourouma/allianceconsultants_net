import type { ReactNode } from "react";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Closing call to action drawn as a coupon with a detachable stub: the text
 * on the left, the action(s) on the stub, joined by a dashed tear line with
 * a pair of scissors. Server component; the actions are passed in.
 */
export function StubCTA({
  title,
  children,
  actions,
  caption = "Coupon à détacher",
  titleId,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  caption?: string;
  titleId?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "coupon relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]",
        className,
      )}
    >
      <div className="px-6 py-10 sm:px-10 md:py-14 lg:px-14">
        <h2 id={titleId} className="t-h2 max-w-[18ch] text-ink">
          {title}
        </h2>
        {children && (
          <div className="t-body mt-5 max-w-[56ch] text-lg leading-relaxed text-ink-soft">
            {children}
          </div>
        )}
      </div>

      <div className="relative border-t-2 border-dashed border-ink bg-[#f6f5fb] px-6 py-8 sm:px-10 lg:border-l-2 lg:border-t-0 lg:px-8 lg:py-14">
        <span
          aria-hidden
          className="absolute -top-[0.9rem] right-8 bg-[linear-gradient(to_bottom,#fff_50%,#f6f5fb_50%)] p-[2px] lg:-left-[0.9rem] lg:right-auto lg:top-10 lg:bg-[linear-gradient(to_right,#fff_50%,#f6f5fb_50%)]"
        >
          <Scissors strokeWidth={1.75} className="size-6 text-ink lg:rotate-90" />
        </span>
        <p className="t-field text-carbon!">{caption}</p>
        <div className="mt-5 flex flex-col items-start gap-4">{actions}</div>
      </div>
    </section>
  );
}
