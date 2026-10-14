import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTAButton } from "@/components/shared/CTAButton";
import { ReassuranceBadges } from "@/components/shared/ReassuranceBadges";
import { CouponWallet } from "@/components/wallet/CouponWallet";
import type { Homepage } from "@/lib/validators/content";

interface HeroProps {
  hero: Homepage["hero"];
}

/** Same construction as the secondary CTAButton, for a plain internal link. */
const OUTLINE_LINK =
  "group/cta inline-flex h-14 items-center justify-center gap-3 rounded-[3px] bg-transparent px-8 font-display text-[1.25rem] font-bold uppercase tracking-[0.06em] text-ink no-underline ring-2 ring-inset ring-ink transition-[background-color,color,transform] duration-200 ease-[var(--ease-out-expo)] hover:bg-ink hover:text-white active:translate-y-[2px]";

/**
 * First viewport of "Le Carnet de coupons": the display headline, one lead,
 * the demo stub + outlined link, a ruled facts line on the left; the coupon
 * wallet (six solutions) on the right.
 */
export function Hero({ hero }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-x-clip pb-16 pt-8 sm:pt-10 min-[1100px]:pb-14 min-[1100px]:pt-11"
    >
      <div className="wrap">
        {/* DOM order reads naturally (title, lead, actions, facts, wallet). Below
            1100px the wallet is moved right after the title so the lifted coupon
            and its stamp land in the first viewport; from 1100px a two-column
            grid places the wallet beside the copy. */}
        <div className="grid min-[1100px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] min-[1100px]:grid-rows-[auto_auto_auto_1fr] min-[1100px]:gap-x-10">
          <h1
            id="hero-title"
            className="t-display order-1 min-w-0 text-ink min-[1100px]:order-none min-[1100px]:col-start-1 min-[1100px]:row-start-1"
            style={{ fontSize: "clamp(2.5rem, 1.1rem + 4.2vw, 4.5rem)" }}
          >
            {hero.title}
          </h1>

          <p className="t-lead order-3 mt-10 max-w-[35rem] text-ink-mute min-[1100px]:order-none min-[1100px]:col-start-1 min-[1100px]:row-start-2 min-[1100px]:mt-7">
            {hero.subtitle}
          </p>

          <div className="order-4 mt-8 flex flex-wrap items-center gap-4 min-[1100px]:order-none min-[1100px]:col-start-1 min-[1100px]:row-start-3">
            {hero.ctas.map((cta, i) =>
              cta.href ? (
                <Link key={i} href={cta.href} className={OUTLINE_LINK}>
                  {cta.label}
                  <ArrowRight
                    className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </Link>
              ) : (
                <CTAButton
                  key={i}
                  intent={cta.intent!}
                  label={cta.label}
                  block="hero"
                  size="lg"
                  variant={i === 0 ? "primary" : "secondary"}
                />
              ),
            )}
          </div>

          <ReassuranceBadges
            badges={hero.reassuranceBadges}
            className="order-5 mt-12 min-[1100px]:order-none min-[1100px]:col-start-1 min-[1100px]:row-start-4 min-[1100px]:self-end"
          />

          <div className="order-2 mt-8 min-w-0 min-[1100px]:order-none min-[1100px]:col-start-2 min-[1100px]:row-span-4 min-[1100px]:row-start-1 min-[1100px]:mt-0">
            <CouponWallet />
          </div>
        </div>
      </div>
    </section>
  );
}
