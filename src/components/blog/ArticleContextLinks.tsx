import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ContextLink {
  href: string;
  label: string;
}

/** Tag de l'article → pages service ou solution correspondantes. */
const LINKS_BY_TAG: Record<string, ContextLink[]> = {
  ged: [
    {
      href: "/services/dematerialisation-archives",
      label: "Numérisation et dématérialisation de vos archives",
    },
    { href: "/solutions/docupro-suite", label: "DocuPro Suite, gestion documentaire" },
  ],
  automatisation: [
    {
      href: "/services/automatisation-ia-processus-metiers",
      label: "Automatisation IA de vos processus métiers",
    },
  ],
  ia: [
    {
      href: "/services/automatisation-ia-processus-metiers",
      label: "Automatisation IA de vos processus métiers",
    },
  ],
  immobilier: [
    { href: "/solutions/immotopia-cloud", label: "ImmoTopia.cloud, logiciel pour agences immobilières" },
  ],
};

export function contextLinksForTags(tagSlugs: string[]): ContextLink[] {
  const seen = new Set<string>();
  const out: ContextLink[] = [];
  for (const slug of tagSlugs) {
    for (const link of LINKS_BY_TAG[slug] ?? []) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      out.push(link);
    }
  }
  return out.slice(0, 5);
}

/** Liens contextuels vers les pages service ou solution liées au sujet de l'article. */
export function ArticleContextLinks({ tagSlugs }: { tagSlugs: string[] }) {
  const links = contextLinksForTags(tagSlugs);
  if (links.length === 0) return null;
  return (
    <aside aria-labelledby="context-links-title" className="mt-10">
      <p id="context-links-title" className="t-field mb-3">
        Pour aller plus loin
      </p>
      <ul className="grid gap-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-11 items-center gap-2 font-medium text-ink underline decoration-red decoration-2 underline-offset-4 hover:decoration-4"
            >
              {l.label}
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
