import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowDown, ExternalLink } from "lucide-react";
import type { SolutionHero as SolutionHeroData } from "@/lib/validators/content";
import { StationStrip } from "./StationStrip";
import { glyphForName } from "@/components/services/serviceMap";
import s from "./Solutions.module.css";
import { cn } from "@/lib/utils";

interface SolutionHeroProps {
  hero: SolutionHeroData;
  category: string;
  /** Optional additions (the page provides them): */
  lineName?: string;
  /** Feature-group titles, drawn as the stations of the line. */
  stations?: string[];
  externalUrl?: string | null;
  breadcrumb?: ReactNode;
}

const PILL =
  "group/cta inline-flex h-14 items-center justify-center gap-4 rounded-full pl-7 pr-2 text-base font-bold no-underline transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)] active:translate-y-px";

export function SolutionHero({
  hero,
  category,
  lineName,
  stations,
  externalUrl,
  breadcrumb,
}: SolutionHeroProps) {
  const secondary = hero.secondaryCta;
  const secondaryExternal = secondary?.href.startsWith("http");
  const showExternal =
    externalUrl && !(secondaryExternal && secondary?.href === externalUrl);

  return (
    <section
      id="hero"
      className={cn(
        "relative isolate overflow-hidden bg-[var(--accent)] text-[var(--on-accent)]",
        s.focusOnAccent,
      )}
    >
      {/* Octilinear strokes: the line leaving the station. Decorative. */}
      <svg
        aria-hidden
        viewBox="0 0 640 420"
        preserveAspectRatio="xMaxYMax slice"
        className="pointer-events-none absolute -right-10 bottom-0 -z-10 hidden h-full w-[62%] max-w-[860px] opacity-[0.16] [mask-image:linear-gradient(to_right,transparent_5%,#000_55%)] sm:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M0 330 H250 L350 230 H640" />
        <path d="M0 395 H190 L330 255 V120 L400 50 H640" />
        <path d="M120 420 L300 240" opacity="0.6" />
      </svg>

      <div className="wrap pb-10 pt-6 lg:pb-14">
        {breadcrumb}

        <div
          className={cn(
            "mt-10 lg:mt-14",
            hero.image && "grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14",
          )}
        >
          <div>
            <h1 className="max-w-[20ch] text-balance font-display text-[clamp(2rem,1.15rem+3.5vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.03em] sm:max-w-[24ch]">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-[62ch] text-pretty text-[1.0625rem] leading-relaxed sm:text-xl sm:leading-relaxed">
              {hero.tagline}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#demander-une-demo"
                data-cta="solution-hero-primary"
                className={cn(PILL, "bg-ink text-white hover:bg-night-2")}
              >
                {hero.primaryCta.label}
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] ring-2 ring-white/70 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-y-0.5"
                >
                  <ArrowDown className="size-5" strokeWidth={2} />
                </span>
              </a>
              {secondary && (
                <a
                  href={secondary.href}
                  {...(secondaryExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={cn(
                    PILL,
                    "pr-7 ring-2 ring-inset ring-[var(--on-accent)] hover:bg-[var(--on-accent)] hover:text-[var(--accent)]",
                  )}
                >
                  {secondary.label}
                  {secondaryExternal && (
                    <ExternalLink aria-hidden className="-ml-1 size-4" strokeWidth={2} />
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
                  className="inline-flex min-h-11 items-center gap-2 text-base font-bold underline decoration-current/50 underline-offset-4 hover:decoration-current"
                >
                  Ouvrir {lineName ?? "le produit"}
                  <ExternalLink aria-hidden className="size-4" strokeWidth={2} />
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              )}
            </div>
          </div>

          {hero.image && (
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              width={hero.image.width}
              height={hero.image.height}
              priority
              className="w-full rounded-md object-cover ring-2 ring-[var(--on-accent)]"
            />
          )}
        </div>

        {stations && stations.length > 0 && (
          <div className="mt-12 border-t-2 border-[var(--on-accent)]/40 pt-6 lg:mt-16">
            <p className="flex items-center gap-3 text-sm font-bold">
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-[var(--on-accent)] font-display text-sm font-extrabold text-[var(--accent)]"
              >
                {glyphForName(lineName ?? category)}
              </span>
              <span>
                {lineName ? `Ligne ${lineName}` : "La ligne"} · {category}
              </span>
            </p>
            <div aria-hidden className="mt-6">
              <StationStrip labels={stations} tone="field" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
