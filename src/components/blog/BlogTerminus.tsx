import { CTAButton } from "@/components/shared/CTAButton";

/** End of the article = the terminus: a line arriving at the demo request. */
export function BlogTerminus() {
  return (
    <section
      aria-labelledby="blog-terminus-title"
      className="relative isolate overflow-hidden rounded-[8px] bg-night px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14"
    >
      <svg
        viewBox="0 0 400 200"
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute -right-4 bottom-0 -z-10 hidden h-full w-[38%] lg:block"
        preserveAspectRatio="xMaxYMid slice"
      >
        <g fill="none" strokeLinejoin="round">
          <path d="M0 150H120L190 80H400" stroke="#07122b" strokeWidth="26" />
          <path d="M0 150H120L190 80H400" stroke="var(--accent)" strokeWidth="14" />
          <path d="M0 190H170L230 130H400" stroke="#07122b" strokeWidth="26" />
          <path d="M0 190H170L230 130H400" stroke="#6d3be0" strokeWidth="14" opacity="0.9" />
        </g>
        <circle cx="120" cy="150" r="11" fill="#fff" stroke="#07122b" strokeWidth="5" />
        <circle cx="330" cy="80" r="22" fill="#fff" stroke="#07122b" strokeWidth="6" />
        <circle cx="330" cy="80" r="8" fill="var(--accent)" />
      </svg>

      <div className="max-w-xl lg:max-w-[34rem]">
        <h2
          id="blog-terminus-title"
          className="font-display text-balance text-[clamp(1.75rem,1.3rem+1.8vw,2.75rem)] font-extrabold leading-[1.04] tracking-[-0.03em]"
        >
          Vous voulez approfondir ce sujet pour votre organisation ?
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/80">
          Nos consultants vous accompagnent : diagnostic digital, automatisation,
          formations, intégration SaaS. Échangeons sur votre contexte.
        </p>
        <div className="mt-7">
          <CTAButton
            intent="demo"
            label="Demander une démo"
            block="final-cta"
            from="blog"
            size="lg"
            onDark
          />
        </div>
      </div>
    </section>
  );
}
