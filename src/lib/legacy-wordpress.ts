/**
 * Anciennes URL WordPress que Google continue d'explorer (l'ancien site du
 * domaine tournait sous WordPress). Elles n'ont aucun équivalent : on répond
 * « 410 Gone » (disparue définitivement) plutôt que 404, ce qui sort ces URL
 * de l'index plus vite. Module sans dépendance, utilisable dans le middleware
 * (runtime Edge) comme dans les tests.
 *
 * Motifs traités :
 *   /tag/*  /author/*  /category/*       archives WordPress
 *   …/feed  …/feed/                      flux RSS WordPress (hors /feed.xml du site)
 *   /wp-*                                wp-admin, wp-content, wp-json, wp-login.php…
 *   /xmlrpc.php
 *   ?replytocom=…                        liens « Répondre » des commentaires
 *
 * Ne concerne PAS les routes du site : /blog/tags/*, /feed.xml, etc. Les
 * comparaisons portent sur des segments entiers (« /tag » ≠ « /tags »).
 *
 * ⚠ Toute modification des motifs doit être répercutée dans `config.matcher`
 * de src/middleware.ts (le matcher décide quand le middleware s'exécute).
 */
export function isLegacyWordPressRequest(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  if (searchParams.has("replytocom")) return true;

  // Ignore la barre finale et la casse (WordPress ne les distinguait pas).
  const path = pathname.toLowerCase().replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  const last = segments[segments.length - 1] ?? "";

  if (first === "tag" || first === "author" || first === "category") return true;
  if (last === "feed") return true;
  if (first.startsWith("wp-")) return true;
  if (path === "/xmlrpc.php") return true;

  return false;
}
