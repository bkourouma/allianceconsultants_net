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
  /** Solution lines this service connects to (interchange). */
  lines: LineId[];
  /** True when the service applies to every product line. */
  transversal?: boolean;
  /**
   * Stations of the service, each one restated from the MDX
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
      "Analyse des processus",
      "Modélisation",
      "Automatisation (n8n, API, LLMs)",
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
  "dematerialisation-archives": {
    lines: ["docupro", "medicpro", "cliniquepro"],
    journey: [
      "Numérisation",
      "Indexation",
      "Archivage électronique",
      "Plan de classement sur mesure",
    ],
  },
  "scanners-professionnels": {
    lines: ["docupro"],
    journey: [
      "Sélection du matériel",
      "Fourniture",
      "Intégration",
      "Formation et support",
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
    slugs: ["dematerialisation-archives", "scanners-professionnels"],
  },
  {
    id: "materiel",
    label: "M'équiper en scanners",
    slugs: ["scanners-professionnels"],
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
    ? { intent: "automation", label: "Automatiser un processus" }
    : { intent: "contact", label: "Demander un échange" };
}
