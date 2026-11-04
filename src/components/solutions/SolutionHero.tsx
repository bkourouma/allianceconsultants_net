import type { ReactNode } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { SolutionHero as SolutionHeroData } from "@/lib/validators/content";
import { CouponBand } from "./CouponBand";
import { couponNo, pad2 } from "./couponMeta";
import s from "./Solutions.module.css";
import { cn } from "@/lib/utils";

interface SolutionHeroProps {
  hero: SolutionHeroData;
  category: string;
  /** Optional additions (the page provides them): */
  lineName?: string;
  /** Product slug: gives the coupon its number. */
  slug?: string;
  /** Feature-group titles, listed as ruled chips on the coupon. */
  areas?: string[];
  externalUrl?: string | null;
  breadcrumb?: ReactNode;
}

const STUB_CTA =
  "group/cta inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[3px] bg-red px-4 py-2 text-center font-display text-[1.0625rem] font-bold uppercase leading-tight tracking-[0.06em] text-white no-underline shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] transition-[background-color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] hover:bg-red-dk active:translate-y-[2px] active:shadow-none";

const OUTLINE_CTA =
  "group/cta inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[3px] px-6 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink no-underline ring-2 ring-inset ring-ink transition-[background-color,color] duration-200 ease-[var(--ease-out-expo)] hover:bg-ink hover:text-white";

/**
 * Wallet hero: one big coupon. Navy band (number, name, accent chip), the H1 and
 * the tagline on the stock, and a detachable red stub holding the primary CTA.
 */
export function SolutionHero({
  hero,
  category,
  lineName,
  slug,
  areas,
  externalUrl,
  breadcrumb,
}: SolutionHeroProps) {
  const secondary = hero.secondaryCta;
  const secondaryExternal = secondary?.href.startsWith("http");
  const showExternal =
    externalUrl && !(secondaryExternal && secondary?.href === externalUrl);
  const no = slug ? couponNo(slug) : 0;

  return (
    <section id="hero" className="pb-12 pt-6 lg:pb-16">
      <div className="wrap">
        {breadcrumb && <div className="text-ink-soft">{breadcrumb}</div>}

        <div className={cn("coupon mt-8 lg:mt-10", s.liftIn)}>
          <CouponBand
            no={no || "•"}
            title={lineName ?? category}
            chip={category}
          />

          <div className="grid lg:grid-cols-[minmax(0,1fr)_17.5rem]">
            <div className="p-6 sm:p-8 lg:p-10">
              <h1 className="max-w-[24ch] text-balance font-display text-[clamp(2.125rem,1.35rem+3vw,3.75rem)] font-extrabold italic leading-[0.96] tracking-[-0.012em] text-ink">
                {hero.headline}
              </h1>
              <p className="t-lead mt-6">{hero.tagline}</p>

              {hero.image && (
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  width={hero.image.width}
                  height={hero.image.height}
                  priority
                  className="mt-8 w-full rounded-[3px] border-2 border-ink object-cover"
                />
              )}

              {(secondary || showExternal) && (
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {secondary && (
                    <a
                      href={secondary.href}
                      {...(secondaryExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={OUTLINE_CTA}
                    >
                      {secondary.label}
                      {secondaryExternal && (
                        <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                      )}
                      {secondaryExternal && (
                        <span className="sr-only"> (nouvel onglet)</span>
                      )}
                    </a>
                  )}
                  {showExternal && (
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 text-base font-bold text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                    >
                      Ouvrir {lineName ?? "le produit"}
                      <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                      <span className="sr-only"> (nouvel onglet)</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Detachable stub */}
            <div className="flex flex-col justify-between gap-6 border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 lg:rounded-br-[2px] lg:border-l-2 lg:border-t-0 lg:p-7">
              <div>
                <p className="t-field !text-carbon">Coupon détachable</p>
                {no > 0 && (
                  <p
                    aria-hidden
                    className="carbon t-num mt-1 font-display text-[4.5rem] font-extrabold leading-[0.85]"
                  >
                    {pad2(no)}
                  </p>
                )}
              </div>
              <a
                href="#demander-une-demo"
                data-cta="solution-hero-primary"
                className={STUB_CTA}
              >
                {hero.primaryCta.label}
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/cta:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2.5v11M4 9.5l4 4 4-4" />
                </svg>
              </a>
            </div>
          </div>

          {areas && areas.length > 0 && (
            <>
              <hr className="tear" />
              <div className="flex flex-col gap-3 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:gap-5 lg:px-10">
                <p className="t-field shrink-0">Ce coupon couvre</p>
                <ul className="flex flex-wrap gap-2">
                  {areas.map((g) => (
                    <li
                      key={g}
                      className="rounded-[3px] border border-ink bg-white px-2.5 py-1 text-[0.8125rem] font-semibold leading-snug text-ink"
                    >
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
