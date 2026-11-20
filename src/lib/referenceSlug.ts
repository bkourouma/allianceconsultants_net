import { slugify } from "@/lib/slug";

const ID_AT_END = /(?:^|-)(c[a-z0-9]{24})$/;

/**
 * Chemin public d'une référence : `/references/<client>-<projet>-<id>`.
 * L'identifiant reste en suffixe pour retrouver la fiche sans changer la base.
 */
export function referencePath(ref: {
  id: string;
  companyName: string;
  projectTitle: string;
}): string {
  const readable = slugify(`${ref.companyName} ${ref.projectTitle}`);
  return `/references/${readable ? `${readable}-` : ""}${ref.id}`;
}

/** Extrait l'identifiant d'un segment d'URL (ancienne forme `<id>` ou nouvelle forme). */
export function referenceIdFromParam(param: string): string {
  return ID_AT_END.exec(param)?.[1] ?? param;
}
