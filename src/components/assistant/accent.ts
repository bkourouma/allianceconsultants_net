import type { CSSProperties } from "react";
import { ACADEMIE, getLine, lineStyle } from "@/lib/network";

/** Portée d'accent d'une ligne du réseau (ou « academie ») : `--accent` / `--on-accent`. */
export function accentStyle(line: string | undefined): CSSProperties | undefined {
  if (line === "academie") {
    return { "--accent": ACADEMIE.color, "--on-accent": ACADEMIE.onColor } as CSSProperties;
  }
  return line && getLine(line) ? lineStyle(line) : undefined;
}

/** Accent de la page courante : ligne de la solution, Académie pour les formations. */
export function pageAccent(pageId: string): CSSProperties | undefined {
  const [section, slug] = pageId.split("/");
  if (section === "solutions" && slug) return accentStyle(slug);
  if (section === "formations") return accentStyle("academie");
  return undefined;
}
