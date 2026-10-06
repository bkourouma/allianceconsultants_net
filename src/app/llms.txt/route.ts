import { NextResponse } from "next/server";
import { listLatestPublishedForFeed } from "@/lib/blog";
import {
  getServices,
  getSiteSettings,
  getSolutions,
  getTrainings,
} from "@/lib/content";
import { listLatestPublishedProjectReferences } from "@/lib/projectReferences";
import { SITE_URL } from "@/lib/seo";

// Rendu à chaque requête (mis en cache HTTP 1 h) : en statique, le fichier serait
// figé au build, sans base de données, et omettrait articles et références.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Une seule ligne, sans retours chariot ni espaces multiples (format Markdown de llms.txt). */
function oneLine(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function link(label: string, path: string, description?: string): string {
  const url = new URL(path, SITE_URL).toString();
  const text = description ? `: ${oneLine(description)}` : "";
  return `- [${oneLine(label)}](${url})${text}`;
}

function section(title: string, lines: string[]): string[] {
  return lines.length > 0 ? [`## ${title}`, "", ...lines, ""] : [];
}

/**
 * Index à destination des assistants IA (convention llms.txt) : présentation de
 * l'entreprise et liens vers les pages de référence. Généré depuis les mêmes
 * sources que le site, il ne peut donc pas diverger du contenu publié.
 */
export async function GET() {
  const [settings, solutions, services, trainings] = await Promise.all([
    getSiteSettings(),
    getSolutions(),
    getServices(),
    getTrainings(),
  ]);

  // Contenus en base : en cas d'indisponibilité (preview, build sans Postgres),
  // on publie le reste plutôt que d'échouer.
  const posts = await listLatestPublishedForFeed(20).catch(() => []);
  const references = await listLatestPublishedProjectReferences(20).catch(() => []);

  const { brand, contact } = settings;
  const sameAs = Object.values(settings.social).filter(Boolean) as string[];

  const lines: string[] = [
    `# ${brand.name}`,
    "",
    `> ${oneLine(brand.tagline)}`,
    "",
    `${brand.name}${brand.alternateName ? ` (${brand.alternateName})` : ""} est actif depuis ${brand.foundingYear}. ` +
      `Siège : ${oneLine(contact.address.street)}. Zone d'intervention : Côte d'Ivoire et Afrique francophone. ` +
      "Le site est en français.",
    "",
    ...section(
      "Solutions logicielles (SaaS métiers)",
      solutions.map((s) =>
        link(s.name, `/solutions/${s.slug}`, `${s.category} — ${s.shortDescription}`),
      ),
    ),
    ...section(
      "Services",
      services.map((s) => link(s.title, `/services/${s.slug}`, s.shortDescription)),
    ),
    ...section(
      "Formations",
      trainings.map((t) =>
        link(t.title, `/formations/${t.slug}`, `${t.category} — ${t.shortDescription}`),
      ),
    ),
    ...section(
      "Références clients",
      references.map((r) =>
        link(
          `${r.companyName} — ${r.projectTitle}`,
          `/references/${r.id}`,
          r.impact ?? r.problem,
        ),
      ),
    ),
    ...section(
      "Blog",
      posts.map((p) => link(p.title, `/blog/${p.slug}`, p.seoDescription ?? p.excerpt)),
    ),
    ...section("Entreprise et contact", [
      link("À propos", "/a-propos", "Histoire, valeurs et expertise de l'entreprise"),
      link("Contact et demande de démo", "/contact-demo"),
      link("Mentions légales", "/mentions-legales"),
      link("Politique de confidentialité", "/privacy"),
      `- Email : ${contact.email}`,
      ...contact.phones.map((phone) => `- Téléphone : ${phone}`),
    ]),
    ...section("Optionnel", [
      link("Flux RSS du blog", "/feed.xml"),
      link("Plan du site", "/sitemap.xml"),
      ...sameAs.map((url) => `- [Profil officiel](${url})`),
    ]),
  ];

  return new NextResponse(lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
