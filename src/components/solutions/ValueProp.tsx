import { Section } from "@/components/ui/Section";
import { SectionHead } from "./SectionHead";

interface ValuePropProps {
  text: string;
  /** Optional heading; defaults to a neutral one. */
  title?: string;
}

export function ValueProp({ text, title = "La valeur en clair" }: ValuePropProps) {
  return (
    <Section id="proposition-de-valeur" bg="gray" padding="md" aria-labelledby="valeur-title">
      <SectionHead id="valeur-title" title={title} />
      <p className="mt-8 max-w-[34ch] text-balance font-display text-[clamp(1.375rem,1rem+1.7vw,2.375rem)] font-semibold leading-[1.22] tracking-[-0.015em] text-ink sm:max-w-[40ch] lg:max-w-[46ch]">
        {text}
      </p>
    </Section>
  );
}
