import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/shared/ServiceCard";
import type { Service } from "@/lib/validators/content";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <Section bg="gray" aria-labelledby="services-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Services experts
        </p>
        <h2
          id="services-title"
          className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          Nos services experts
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Au-delà de nos solutions logicielles, nous intervenons en conseil,
          développement sur mesure et déploiement de matériel pour accompagner
          votre transformation digitale de bout en bout.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </Section>
  );
}
