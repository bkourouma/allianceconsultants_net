import { Section } from "@/components/ui/Section";

interface ValuePropProps {
  text: string;
}

export function ValueProp({ text }: ValuePropProps) {
  return (
    <Section bg="white" padding="md">
      <div className="mx-auto max-w-4xl">
        <p className="text-balance text-center text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl lg:text-3xl">
          {text}
        </p>
      </div>
    </Section>
  );
}
