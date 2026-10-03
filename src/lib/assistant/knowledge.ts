import {
  getAllSolutionDetailSlugs,
  getServices,
  getSiteSettings,
  getSolutionDetailBySlug,
  getTrainings,
} from "@/lib/content";

let cached: string | null = null;

const MODALITY_LABELS = {
  presentiel: "présentiel",
  distanciel: "à distance",
  intra: "intra-entreprise",
} as const;

/**
 * Base de connaissances de l'assistant, construite à partir de content/ : l'assistant ne dit
 * donc que ce que le site publie. Les indicateurs chiffrés (`benefits[].metric`, gains de
 * productivité…) sont volontairement exclus : ils ne sont pas validés (voir PRODUCT.md).
 */
export async function getKnowledgeBase(): Promise<string> {
  if (cached && process.env.NODE_ENV === "production") return cached;

  const [slugs, services, trainings, settings] = await Promise.all([
    getAllSolutionDetailSlugs(),
    getServices(),
    getTrainings(),
    getSiteSettings(),
  ]);

  const solutions = (
    await Promise.all(slugs.map((slug) => getSolutionDetailBySlug(slug)))
  )
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => a.homepageOrder - b.homepageOrder);

  const out: string[] = [];

  out.push("## SOLUTIONS (produits SaaS d'Alliance Consultants)");
  for (const s of solutions) {
    const lines = [
      `### ${s.name} — ${s.category}`,
      `Page : /solutions/${s.slug}${s.externalUrl ? ` · Site du produit : ${s.externalUrl}` : ""}`,
      `Présentation : ${s.valueProposition}`,
      `Pour qui : ${s.targetAudience.map((t) => `${t.label} (${t.description})`).join(" ; ")}`,
      `Problèmes résolus : ${s.problemsSolved.join(" ; ")}`,
      `Fonctionnalités : ${s.featureGroups
        .map((g) => `${g.title} → ${g.features.map((f) => f.title).join(", ")}`)
        .join(" | ")}`,
      `Bénéfices : ${s.benefits.map((b) => `${b.title} — ${b.description}`).join(" ; ")}`,
    ];
    if (s.useCases?.length) {
      lines.push(`Cas d'usage : ${s.useCases.map((u) => `${u.title} — ${u.summary}`).join(" ; ")}`);
    }
    lines.push(`FAQ : ${s.faq.map((f) => `Q: ${f.question} R: ${f.answer}`).join(" || ")}`);
    out.push(lines.join("\n"));
  }

  out.push("## SERVICES");
  for (const s of services) {
    out.push(`### ${s.title}\nPage : /services/${s.slug}\n${s.shortDescription}`);
  }

  out.push("## FORMATIONS (Académie Alliance — durées et tarifs non communiqués ici)");
  for (const t of trainings) {
    const modalities = (Object.keys(MODALITY_LABELS) as (keyof typeof MODALITY_LABELS)[])
      .filter((k) => t.modalities[k])
      .map((k) => MODALITY_LABELS[k])
      .join(", ");
    out.push(
      `### ${t.title} — ${t.category}\nPage : /formations/${t.slug}\n${t.shortDescription}\nModalités : ${modalities}`,
    );
  }

  const phones = settings.contact.phones.join(" / ");
  out.push(
    [
      "## CONTACT ET PAGES UTILES",
      `Alliance Consultants (${settings.brand.alternateName ?? settings.brand.name}), fondée en ${settings.brand.foundingYear}, ${settings.contact.address.street}.`,
      `${settings.brand.tagline}`,
      `Téléphone : ${phones}${settings.contact.whatsapp ? ` · WhatsApp : ${settings.contact.whatsapp}` : ""}`,
      "Formulaire de demande de démo ou de contact : /contact-demo · Références : /references · À propos : /a-propos · Blog : /blog",
    ].join("\n"),
  );

  cached = out.join("\n\n");
  return cached;
}
