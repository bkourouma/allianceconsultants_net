import { z } from "zod";

/**
 * FAQ d'un article de blog.
 *
 * Un article déclare ses questions fréquentes dans la colonne JSON `faq` de
 * `BlogPost` : un tableau d'objets `{ "question": "...", "answer": "..." }`.
 * Quand le tableau n'est pas vide, la page /blog/[slug] affiche
 * automatiquement :
 *   - une section visible « Questions fréquentes » sous le corps de l'article
 *     (composant `ArticleFaq`, accordéon <details> natif) ;
 *   - le JSON-LD `FAQPage` correspondant (même gabarit que les pages
 *     solutions : `buildFaqJsonLd` dans `src/lib/seo.ts`).
 *
 * Comment déclarer une FAQ :
 *   - articles du seed (`prisma/seed.ts`) : ajouter `faq: [{ question, answer }, ...]`
 *     à l'objet de l'article, à côté de `bodyHtml` ;
 *   - API d'administration (`POST/PATCH /api/admin/blog`) : champ `faq` du corps
 *     de la requête (tableau, ou `null` pour retirer la FAQ).
 *
 * Règles : questions de 10 à 200 caractères, réponses de 10 à 1 500 caractères
 * en TEXTE BRUT (pas de HTML : la réponse est reprise telle quelle dans le
 * JSON-LD), 20 entrées au maximum. Ne pas répéter la FAQ dans `bodyHtml`.
 * Les entrées invalides sont ignorées à l'affichage plutôt que de casser la page.
 */
export const PostFaqEntrySchema = z.object({
  question: z.string().trim().min(10).max(200),
  answer: z.string().trim().min(10).max(1500),
});

export const PostFaqSchema = z.array(PostFaqEntrySchema).max(20);

export type PostFaqEntry = z.infer<typeof PostFaqEntrySchema>;

/** Lit la colonne JSON `faq` : renvoie uniquement les entrées valides. */
export function parsePostFaq(raw: unknown): PostFaqEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: PostFaqEntry[] = [];
  for (const item of raw) {
    const parsed = PostFaqEntrySchema.safeParse(item);
    if (parsed.success) entries.push(parsed.data);
  }
  return entries.slice(0, 20);
}
