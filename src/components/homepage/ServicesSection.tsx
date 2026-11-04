import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { ServicesPad } from "@/components/homepage/services/ServicesPad";
import type { Service } from "@/lib/validators/content";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <Section bg="gray" padding="md" aria-labelledby="services-title" className="lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-16">
        <header className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="services-title" className="t-h2 m-0 text-ink">
            Nos services experts
          </h2>
          <p className="t-lead mt-5 max-w-[48ch]">
            Au-delà de nos solutions logicielles, nous intervenons en conseil,
            développement sur mesure, automatisation et dématérialisation pour accompagner
            votre transformation digitale de bout en bout.
          </p>
          <p className="m-0 mt-4">
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center gap-1.5 text-base font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-red"
            >
              Tous les services
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
          </p>
        </header>

        <ServicesPad services={services} />
      </div>
    </Section>
  );
}
