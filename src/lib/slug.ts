import { prisma } from "@/lib/prisma";

const FRENCH_DIACRITICS_MAP: Record<string, string> = {
  œ: "oe",
  Œ: "oe",
  æ: "ae",
  Æ: "ae",
};

/**
 * Convertit une chaîne (FR) en slug kebab-case ASCII : minuscule, sans
 * accents, sans ponctuation, espaces et tirets multiples regroupés.
 */
export function slugify(input: string): string {
  if (!input) return "";
  let s = input.normalize("NFKD");
  for (const [from, to] of Object.entries(FRENCH_DIACRITICS_MAP)) {
    s = s.split(from).join(to);
  }
  s = s
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return s.slice(0, 80);
}

/**
 * Garantit l'unicité du slug parmi les `BlogPost` (sauf le post `excludeId`).
 * Si le slug est déjà pris, ajoute un suffixe numérique `-2`, `-3`, ...
 */
export async function ensureUniqueBlogPostSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  const base = baseSlug || "article";
  let candidate = base;
  let n = 2;
  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 999) {
      throw new Error(`Impossible de générer un slug unique pour "${base}".`);
    }
  }
}
