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
      label: "Numérisation et dématérialisation des archives",
    },
    {
      href: "/solutions/docupro-suite",
      label: "DocuPro Suite, GED & archivage électronique",
    },
  ],
  automatisation: [
    {
      href: "/services/automatisation-ia-processus-metiers",
      label: "Automatisation IA des processus métiers",
    },
    {
      href: "/formations/automatisation-n8n-processus-ia",
      label: "Formation automatisation n8n & processus IA",
    },
  ],
  ia: [
    {
      href: "/services/automatisation-ia-processus-metiers",
      label: "Automatisation IA des processus métiers",
    },
    {
      href: "/formations/ia-entreprise",
      label: "Formation IA en entreprise à Abidjan",
    },
  ],
  immobilier: [
    {
      href: "/solutions/immotopia-cloud",
      label: "ImmoTopia.cloud, logiciel immobilier & gestion locative",
    },
  ],
  sante: [
    {
      href: "/solutions/cliniquepro",
      label: "CliniquePro, gestion de clinique et cabinet médical",
    },
  ],
  developpement: [
    {
      href: "/services/developpement-specifique",
      label: "Développement spécifique & applications sur mesure",
    },
    {
      href: "/formations/developpement-web-dotnet-ia",
      label: "Formation développement web, .NET & IA",
    },
  ],
  donnees: [
    {
      href: "/formations/sql-server",
      label: "Formation SQL Server & bases de données",
    },
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
  return out.slice(0, 4);
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
      <ul className="grid gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-11 items-center gap-2 py-2 font-medium text-ink underline decoration-red decoration-2 underline-offset-4 hover:decoration-4 leading-snug break-words"
            >
              <span>{l.label}</span>
              <ArrowRight aria-hidden className="size-4 shrink-0" strokeWidth={2} />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
