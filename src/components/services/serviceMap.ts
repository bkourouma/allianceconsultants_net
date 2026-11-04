import { LINES, type LineId } from "@/lib/network";

/** Short glyph shown inside a line roundel (initials alone are ambiguous). */
export const LINE_GLYPH: Record<LineId, string> = {
  docupro: "D",
  medicpro: "M",
  cliniquepro: "C",
  immotopia: "I",
  annonces: "A",
  ecole: "É",
};

const ALL: LineId[] = LINES.map((l) => l.id);

/**
 * Roundel glyph for a line given its display name. ImmoTopia and
 * Immo-Annonces both start with "I": the glyph map keeps them apart.
 */
export function glyphForName(name: string): string {
  const key = name.trim().toLowerCase();
  const line = LINES.find(
    (l) => l.name.toLowerCase() === key || key.startsWith(l.name.toLowerCase()),
  );
  return line ? LINE_GLYPH[line.id] : name.charAt(0).toUpperCase();
}

interface ServiceMeta {
  /** Solution products this service connects to. */
  lines: LineId[];
  /** True when the service applies to every product. */
  transversal?: boolean;
  /**
   * Steps of the service, each one restated from the MDX
   * `shortDescription` (no invented steps).
   */
  journey: string[];
}

export const SERVICE_META: Record<string, ServiceMeta> = {
  "developpement-specifique": {
    lines: ALL,
    transversal: true,
    journey: [
      "Spécification fonctionnelle",
      "Développement web, mobile et API",
      "SaaS multi-tenant",
      "Déploiement en production",
    ],
  },
  "automatisation-ia-processus-metiers": {
    lines: ["docupro", "medicpro", "immotopia"],
    journey: [
      "Audit de 5 jours",
      "Prototype",
      "Déploiement",
      "Suivi des indicateurs",
    ],
  },
  "assistance-maitrise-ouvrage": {
    lines: ALL,
    transversal: true,
    journey: [
      "Cahier des charges",
      "Pilotage des prestataires",
      "Recette fonctionnelle",
      "Conduite du changement",
    ],
  },
  // Aucun service « scanners » publié aujourd'hui (Alliance ne vend pas de
  // matériel) : l'entrée reste prête si une page de ce type est ajoutée.
  "scanners-professionnels": {
    lines: ["docupro"],
    journey: [],
  },
  "dematerialisation-archives": {
    lines: ["docupro", "medicpro", "cliniquepro"],
    journey: [
      "Conseil et méthode",
      "Numérisation",
      "Indexation, plan de classement et archivage",
      "Intégration à la GED DocuPro Suite",
    ],
  },
};

/** "Quel besoin ?" selector. Labels are plain-language restatements. */
export const NEEDS: { id: string; label: string; slugs: string[] }[] = [
  {
    id: "sur-mesure",
    label: "Un logiciel sur mesure",
    slugs: ["developpement-specifique"],
  },
  {
    id: "automatiser",
    label: "Automatiser des tâches répétitives",
    slugs: ["automatisation-ia-processus-metiers"],
  },
  {
    id: "piloter",
    label: "Cadrer et piloter un projet IT",
    slugs: ["assistance-maitrise-ouvrage"],
  },
  {
    id: "numeriser",
    label: "Numériser mes archives",
    slugs: ["dematerialisation-archives"],
  },
];

export function linesForService(slug: string): LineId[] {
  return SERVICE_META[slug]?.lines ?? [];
}

/** Automation intent for the AI service, plain contact otherwise. */
export function serviceCta(slug: string): {
  intent: "automation" | "contact";
  label: string;
} {
  return slug.includes("automatisation")
    ? { intent: "automation", label: "Demander un audit" }
    : { intent: "contact", label: "Demander un échange" };
}
