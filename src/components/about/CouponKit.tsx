import { cn } from "@/lib/utils";

/**
 * Small construction pieces of the carnet de coupons, shared by the inner
 * pages: the punched notch and the dashed tear line that cuts a coupon in two.
 * Server components, no JS.
 */

const NOTCH =
  "absolute top-[-8px] size-[18px] rounded-full border-2 border-ink";

/**
 * The perforation of a coupon: a dashed navy tear line with a punched
 * half-circle on each outer edge. Place it as a direct child of a `.coupon`
 * (no horizontal padding on the parent) so the notches sit on the border.
 */
export function Perforation({
  className,
  fill = "var(--color-enamel)",
}: {
  className?: string;
  /** Colour of the ground behind the coupon (the notch is "punched" out of it). */
  fill?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("tear relative h-0", className)}
      role="presentation"
    >
      <span
        className={cn(NOTCH, "left-[-11px]")}
        style={{ background: fill, clipPath: "inset(0 0 0 50%)" }}
      />
      <span
        className={cn(NOTCH, "right-[-11px]")}
        style={{ background: fill, clipPath: "inset(0 50% 0 0)" }}
      />
    </div>
  );
}

/** Mono field caption used inside coupons (visible label, never an eyebrow). */
export function FieldCaption({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("t-field", className)}>{children}</p>;
}
