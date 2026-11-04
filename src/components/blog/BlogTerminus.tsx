import { CTAButton } from "@/components/shared/CTAButton";

/**
 * End of the article: a closing coupon with its detachable red stub, the
 * single demo action. Stacks on mobile (horizontal tear line), side by side
 * from `md` (vertical tear line).
 */
export function BlogTerminus() {
  return (
    <section
      aria-labelledby="blog-terminus-title"
      className="coupon grid overflow-hidden md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="p-6 sm:p-10 lg:p-12">
        <h2 id="blog-terminus-title" className="t-h2 max-w-[22ch] text-ink">
          Vous voulez approfondir ce sujet pour votre organisation ?
        </h2>
        <p className="t-lead mt-5">
          Nos consultants vous accompagnent : diagnostic digital, automatisation,
          formations, intégration SaaS. Échangeons sur votre contexte.
        </p>
      </div>

      <div className="flex items-center border-t-2 border-dashed border-ink bg-enamel/70 p-6 sm:p-10 md:border-l-2 md:border-t-0 md:px-10">
        <CTAButton
          intent="demo"
          label="Demander une démo"
          block="final-cta"
          from="blog"
          size="lg"
          className="w-full md:w-auto"
        />
      </div>
    </section>
  );
}
