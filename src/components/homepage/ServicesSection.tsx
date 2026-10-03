import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ServicesNetwork } from "@/components/homepage/services/ServicesNetwork";
import type { Service } from "@/lib/validators/content";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <Section bg="gray" padding="md" aria-labelledby="services-title" className="lg:py-24">
      {/* The heading is the origin of the Correspondances line: the ink spine
          starts at its station dot and runs straight into the first service. */}
      <header className="relative pb-7 pl-10 sm:pl-12 lg:pb-9">
        <span
          aria-hidden
          className="absolute left-0 top-[0.55em] z-[1] size-[26px] rounded-full border-[5px] border-ink bg-ink sm:size-[30px] lg:top-[0.7em]"
        />
        <span
          aria-hidden
          className="absolute bottom-0 left-[13px] top-[1.4em] w-1 -translate-x-1/2 rounded-full bg-ink sm:left-[15px]"
        />
        <h2 id="services-title" className="t-h2 m-0 text-ink">
          Nos services experts
        </h2>
        <p className="t-lead mt-4 max-w-[60ch]">
          Au-delà de nos solutions logicielles, nous intervenons en conseil,
          développement sur mesure et déploiement de matériel pour accompagner
          votre transformation digitale de bout en bout.
        </p>
        <p className="m-0 mt-2">
          <Link
            href="/services"
            className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            Tous les services
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </Link>
        </p>
      </header>

      <ServicesNetwork services={services} />
    </Section>
  );
}
