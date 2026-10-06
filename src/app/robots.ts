import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Politique d'accès des robots.
 *
 * Chaque groupe `User-agent` explicite ignore le groupe `*` : les zones privées
 * doivent donc être répétées dans chacun, sinon ces robots pourraient les
 * explorer.
 *
 * Choix éditorial : le site est une vitrine commerciale, la visibilité dans les
 * réponses des assistants IA est un objectif. On autorise donc les robots de
 * recherche/réponse IA ET ceux d'entraînement. Pour refuser l'entraînement des
 * modèles, déplacer les robots concernés de AI_TRAINING_BOTS vers un groupe
 * `disallow: "/"`.
 */
const PRIVATE_PATHS = ["/admin/", "/api/"];

/** Robots qui explorent pour répondre à un utilisateur (recherche, citations, navigation à la demande). */
const AI_SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "DuckAssistBot",
  "MistralAI-User",
];

/** Robots qui collectent du contenu pour entraîner ou améliorer des modèles. */
const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_SEARCH_BOTS, allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_TRAINING_BOTS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
