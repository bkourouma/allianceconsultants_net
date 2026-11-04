import { cn } from "@/lib/utils";

interface CouponBandProps {
  /** Coupon number shown in the white cell. */
  no: number | string;
  title: string;
  /** Product accent chip on the right (sector / category). */
  chip?: string;
  /** Use "h3" when the band is the heading of its coupon. */
  titleAs?: "p" | "h3";
  className?: string;
}

/**
 * The navy header of a coupon: white number cell, name, accent chip.
 * Colours of the chip come from the ambient --accent / --on-accent.
 */
export function CouponBand({
  no,
  title,
  chip,
  titleAs: Title = "p",
  className,
}: CouponBandProps) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-stretch overflow-hidden rounded-t-[2px] bg-ink text-white",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid w-11 shrink-0 place-items-center border-r-2 border-ink bg-white font-display text-2xl font-extrabold text-ink sm:w-12"
      >
        {no}
      </span>
      <Title className="m-0 flex min-w-0 flex-1 items-center px-3.5 font-display text-base font-bold uppercase leading-tight tracking-[0.1em] sm:px-5 sm:text-lg">
        {title}
      </Title>
      {chip && (
        <span className="grid max-w-[45%] shrink-0 place-items-center bg-[var(--accent)] px-3 text-center font-mono text-[0.625rem] font-semibold uppercase leading-tight tracking-[0.08em] text-[var(--on-accent)] sm:px-5 sm:text-[0.6875rem]">
          {chip}
        </span>
      )}
    </div>
  );
}
