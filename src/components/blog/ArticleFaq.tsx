import { Plus } from "lucide-react";
import type { PostFaqEntry } from "@/lib/blog-faq";

/**
 * « Questions fréquentes » d'un article (voir src/lib/blog-faq.ts).
 * Même accordéon <details> natif que la FAQ des pages solutions : clavier,
 * état annoncé, fonctionne sans JS, réponses toujours dans le DOM.
 * Chaque question est un petit coupon, séparés par de l'espace.
 * Le JSON-LD FAQPage est émis par la page.
 */
export function ArticleFaq({ entries }: { entries: PostFaqEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section
      id="questions-frequentes"
      aria-labelledby="article-faq-title"
      className="mt-14 scroll-mt-28"
    >
      <h2 id="article-faq-title" className="t-h2 mb-6 text-ink">
        Questions fréquentes
      </h2>
      <div className="grid gap-3">
        {entries.map((entry) => (
          <details key={entry.question} className="coupon group overflow-hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 px-4 py-3 marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-[1.1875rem] font-bold leading-snug text-ink">
                {entry.question}
              </span>
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-[3px] bg-ink text-white transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45"
              >
                <Plus className="size-4" strokeWidth={2.25} />
              </span>
            </summary>
            <div className="border-t-2 border-dashed border-ink px-4 py-4 sm:px-5">
              <p className="t-body text-[1.0625rem] leading-relaxed text-ink-soft">{entry.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
