import Image from "next/image";
import type { SolutionHero as SolutionHeroData } from "@/lib/validators/content";

interface SolutionHeroProps {
  hero: SolutionHeroData;
  category: string;
}

export function SolutionHero({ hero, category }: SolutionHeroProps) {
  const hasImage = Boolean(hero.image);

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 100% 0%, rgba(59,130,246,0.18), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(245,158,11,0.10), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div
          className={
            hasImage
              ? "grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              : "max-w-3xl"
          }
        >
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              {category}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {hero.tagline}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#demander-une-demo"
                data-cta="solution-hero-primary"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {hero.primaryCta.label}
              </a>
              {hero.secondaryCta && (
                <a
                  href={hero.secondaryCta.href}
                  {...(hero.secondaryCta.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-primary px-6 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {hero.secondaryCta.label}
                </a>
              )}
            </div>
          </div>

          {hero.image && (
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-xl"
              />
              <Image
                src={hero.image.src}
                alt={hero.image.alt}
                width={hero.image.width}
                height={hero.image.height}
                priority
                className="w-full rounded-2xl border border-slate-200/70 object-cover shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
