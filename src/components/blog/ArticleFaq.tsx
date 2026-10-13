import { Plus } from "lucide-react";
import type { PostFaqEntry } from "@/lib/blog-faq";

/**
 * « Questions fréquentes » d'un article (voir src/lib/blog-faq.ts).
 * Même accordéon <details> natif que la FAQ des pages solutions : clavier,
 * état annoncé, fonctionne sans JS, réponses toujours dans le DOM.
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
      <h2 id="article-faq-title" className="t-h3 mb-6 text-ink">
        Questions fréquentes
      </h2>
      <div className="border-t-2 border-ink">
        {entries.map((entry) => (
          <details key={entry.question} className="group border-b border-rule">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="font-display text-lg font-bold leading-snug tracking-[-0.01em] text-ink">
                {entry.question}
              </span>
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45"
              >
                <Plus className="size-5" strokeWidth={2.25} />
              </span>
            </summary>
            <p className="t-body pb-6 pr-12 text-[1.0625rem] leading-relaxed text-ink-soft">
              {entry.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
