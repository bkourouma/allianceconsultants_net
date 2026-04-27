import Image from "next/image";
import { Section } from "@/components/ui/Section";
import type { SolutionHero as SolutionHeroData } from "@/lib/validators/content";

interface SolutionHeroProps {
  hero: SolutionHeroData;
  category: string;
}

export function SolutionHero({ hero, category }: SolutionHeroProps) {
  const hasImage = Boolean(hero.image);

  return (
    <Section bg="white" padding="md" container={false}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={hasImage ? "grid items-center gap-10 lg:grid-cols-2" : ""}>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {category}
            </p>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {hero.headline}
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-gray-600">{hero.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#demander-une-demo"
                data-cta="solution-hero-primary"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              >
                {hero.primaryCta.label}
              </a>
              {hero.secondaryCta && (
                <a
                  href={hero.secondaryCta.href}
                  {...(hero.secondaryCta.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary)] px-6 py-3 text-base font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                >
                  {hero.secondaryCta.label}
                </a>
              )}
            </div>
          </div>
          {hero.image && (
            <div className="relative">
              <Image
                src={hero.image.src}
                alt={hero.image.alt}
                width={hero.image.width}
                height={hero.image.height}
                priority
                className="h-auto w-full rounded-xl object-cover shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
