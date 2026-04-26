import { Section } from "@/components/ui/Section";
import { ServiceCard } from "@/components/shared/ServiceCard";
import type { Service } from "@/lib/validators/content";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <Section bg="gray" aria-labelledby="services-title">
      <div className="text-center">
        <h2
          id="services-title"
          className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
        >
          Nos services experts
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Au-delà de nos solutions logicielles, nous intervenons en conseil, développement sur mesure
          et déploiement de matériel pour accompagner votre transformation digitale de bout en bout.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </Section>
  );
}
