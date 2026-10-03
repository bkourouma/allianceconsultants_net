import { LINES, type LineId } from "@/lib/network";
import type { Service } from "@/lib/validators/content";

const ALL: LineId[] = LINES.map((l) => l.id);

/**
 * Which solution lines each service connects to (the "correspondance").
 * Editorial mapping: cross-cutting services serve every line, documentary
 * services follow the document-heavy products.
 */
export const SERVICE_LINES: Record<string, LineId[]> = {
  "developpement-specifique": ALL,
  "assistance-maitrise-ouvrage": ALL,
  "automatisation-ia-processus-metiers": ["docupro", "medicpro", "immotopia"],
  "dematerialisation-archives": ["docupro", "medicpro", "cliniquepro"],
  "scanners-professionnels": ["docupro"],
};

export function linesForService(slug: string): LineId[] {
  return SERVICE_LINES[slug] ?? ALL;
}

/** Roundel code shown inside each line badge (kept short, like a line number). */
export const ROUNDEL_CODE: Record<LineId, string> = {
  docupro: "D",
  medicpro: "M",
  cliniquepro: "C",
  immotopia: "I",
  annonces: "A",
  ecole: "É",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const trimDot = (s: string) => s.trim().replace(/[.\s]+$/, "");

export interface ParsedService {
  /** First clause: the one-sentence description shown collapsed. */
  summary: string;
  /** Key points derived from the MDX short description. */
  points: string[];
}

/**
 * Splits the MDX `shortDescription` into a one-line summary and key points,
 * using only the wording of the content itself.
 */
export function parseService(service: Service): ParsedService {
  const desc = trimDot(service.shortDescription);
  const [head, ...rest] = desc.split(" : ");

  if (rest.length > 0) {
    const [list, ...extras] = rest.join(" : ").split(" — ");
    let items = list.split(/,\s*| et (?=\S)/).map(trimDot).filter(Boolean);
    if (items.length > 1 && items.slice(1).every((i) => /^(de |d')/.test(i))) {
      items = [items.join(", ")];
    }
    const points = [...items, ...extras.map((e) => trimDot(e).replace(/^avec /, ''))].map(cap);
    return { summary: head, points };
  }

  const [first, ...parts] = desc.split(/ (?=grâce à |pour )/);
  return { summary: first, points: parts.map((p) => cap(trimDot(p))) };
}

/**
 * The MDX `benefit` may carry unvalidated percentages: never surface a figure.
 * Keeps the figure-free tail of the sentence when there is one.
 */
export function safeBenefit(benefit: string): string | null {
  const text = trimDot(benefit);
  if (!/\d\s*%/.test(text)) return text + ".";
  const m = text.match(/\d[\d\s]*(?:à\s*\d+)?\s*%\s*et\s+(.+)$/i);
  return m ? cap(trimDot(m[1])) + "." : null;
}
