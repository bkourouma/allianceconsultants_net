/**
 * RÉSEAU — the shared data model of the design world.
 * Alliance Consultants is drawn as a transit network: every solution is a
 * LINE, every module a STATION, services are CORRESPONDANCES (interchanges),
 * formations are the circular ACADÉMIE line, a demo request is the TERMINUS.
 *
 * Colours live in src/styles/globals.css (--color-line-*). Use the helper
 * `lineStyle(id)` or the `.line-<id>` utility class to scope `--accent`.
 */

export type LineId =
  | "docupro"
  | "medicpro"
  | "cliniquepro"
  | "immotopia"
  | "annonces"
  | "ecole";

export interface NetworkLine {
  id: LineId;
  /** Slug of the matching content/solutions/*.mdx file. */
  slug: string;
  /** Product name as displayed. */
  name: string;
  /** One-letter roundel glyph (distinct per line). */
  glyph: string;
  /** Short sector label used by the journey planner ("Je cherche…"). */
  sector: string;
  /** One-line pitch for compact surfaces. Keep it factual (see PRODUCT.md). */
  pitch: string;
  /** Line colour (must match the CSS token). */
  color: string;
  /** Readable text colour on top of `color`. */
  onColor: string;
}

export const LINES: readonly NetworkLine[] = [
  {
    id: "docupro",
    glyph: "D",
    slug: "docupro-suite",
    name: "DocuPro Suite",
    sector: "Archives & GED",
    pitch: "Gestion électronique des documents, courriers et workflows.",
    color: "#1457f5",
    onColor: "#ffffff",
  },
  {
    id: "medicpro",
    glyph: "M",
    slug: "medicpro",
    name: "MedicPro",
    sector: "Pharma & réglementaire",
    pitch: "Suivi des AMM, visas, produits, stocks et ventes multi-pays.",
    color: "#098240",
    onColor: "#ffffff",
  },
  {
    id: "cliniquepro",
    glyph: "C",
    slug: "cliniquepro",
    name: "CliniquePro",
    sector: "Cliniques & santé",
    pitch: "Patients, agenda, consultations et caisse d'une clinique, d'un centre de santé ou d'un cabinet.",
    color: "#00789a",
    onColor: "#ffffff",
  },
  {
    id: "immotopia",
    glyph: "I",
    slug: "immotopia-cloud",
    name: "ImmoTopia.cloud",
    sector: "Immobilier & syndic",
    pitch: "Biens, CRM, gestion locative et copropriétés sur une seule plateforme.",
    color: "#f26a1b",
    onColor: "#0b1b3a",
  },
  {
    id: "annonces",
    glyph: "A",
    slug: "annonces-web",
    name: "Immo-Annonces.fr",
    sector: "Annonces immobilières",
    pitch: "La place de marché immobilière mobile-first pour la Côte d'Ivoire.",
    color: "#e0245e",
    onColor: "#ffffff",
  },
  {
    id: "ecole",
    glyph: "É",
    slug: "ecole-digitale",
    name: "École Digitale",
    sector: "Écoles & formation",
    pitch: "Gestion scolaire multi-établissements : élèves, notes, présences, paiements.",
    color: "#f5b800",
    onColor: "#0b1b3a",
  },
] as const;

export function getLine(idOrSlug: string): NetworkLine | undefined {
  return LINES.find((l) => l.id === idOrSlug || l.slug === idOrSlug);
}

/** Inline style that scopes `--accent` / `--on-accent` to a line. */
export function lineStyle(idOrSlug: string | undefined): React.CSSProperties {
  const line = idOrSlug ? getLine(idOrSlug) : undefined;
  if (!line) return {};
  return {
    "--accent": line.color,
    "--on-accent": line.onColor,
  } as React.CSSProperties;
}

/** Colour of the Académie (formations) circular line. */
export const ACADEMIE = { color: "#6d3be0", onColor: "#ffffff" } as const;
