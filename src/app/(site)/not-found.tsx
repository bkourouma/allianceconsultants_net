import type { Metadata } from "next";
import { PillLink } from "@/components/about/PillLink";

export const metadata: Metadata = {
  title: { absolute: "Page introuvable | Alliance Consultants" },
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/solutions", label: "Nos solutions" },
  { href: "/services", label: "Nos services" },
  { href: "/formations", label: "Nos formations" },
  { href: "/blog", label: "Le blog" },
];

export default function SiteNotFound() {
  return (
    <section className="bg-enamel">
      <div className="wrap pb-16 pt-14 lg:pb-24 lg:pt-20">
        <p className="t-num text-sm font-bold uppercase tracking-widest text-ink-mute">
          Erreur 404
        </p>
        <h1 className="t-display mt-4 max-w-[18ch] text-ink">
          Cette page n&apos;existe pas ou a été déplacée
        </h1>
        <p className="t-lead mt-6 max-w-[60ch]">
          L&apos;adresse saisie ne correspond à aucune page du site. Reprenez
          depuis l&apos;accueil ou explorez l&apos;une de nos rubriques.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
          <PillLink href="/" size="lg">
            Retour à l&apos;accueil
          </PillLink>
          <PillLink href="/contact-demo" size="lg" variant="secondary">
            Nous contacter
          </PillLink>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink/15 pt-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="inline-flex min-h-11 items-center text-[0.9375rem] font-bold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:decoration-4"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
