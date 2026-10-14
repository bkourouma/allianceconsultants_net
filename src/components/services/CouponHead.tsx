import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Header band of a coupon: white numeral box, mono label, optional right
 * caption. Navy by default; `tone="accent"` uses the scoped --accent.
 */
export function CouponHead({
  no,
  label,
  right,
  tone = "ink",
  className,
}: {
  no: string;
  label: string;
  right?: ReactNode;
  tone?: "ink" | "accent";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-stretch overflow-hidden rounded-t-[2px] text-white",
        tone === "accent" ? "bg-[var(--accent)]" : "bg-ink",
        className,
      )}
    >
      <span className="grid w-12 shrink-0 place-items-center border-r-2 border-ink bg-white font-display text-[1.75rem] font-extrabold leading-none text-carbon sm:w-14">
        {no}
      </span>
      <span className="flex min-w-0 flex-1 items-center px-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
        {label}
      </span>
      {right && (
        <span className="hidden items-center px-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-white/85 sm:flex">
          {right}
        </span>
      )}
    </div>
  );
}
