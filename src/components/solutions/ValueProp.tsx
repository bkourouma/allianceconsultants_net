import { Section } from "@/components/ui/Section";

interface ValuePropProps {
  text: string;
}

export function ValueProp({ text }: ValuePropProps) {
  return (
    <Section bg="gray" className="!py-12 lg:!py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="sr-only">Notre proposition de valeur</h2>
        <p className="text-xl leading-relaxed text-gray-800 sm:text-2xl">
          {text}
        </p>
      </div>
    </Section>
  );
}
