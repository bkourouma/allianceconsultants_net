/**
 * Construction et validation de la `callbackUrl` du backoffice.
 *
 * Pourquoi : derrière Docker, `request.nextUrl` (donc `nextUrl.href`) contient
 * l'adresse INTERNE du serveur (`http://<id-du-conteneur>:3000/...`), pas l'adresse
 * publique. NextAuth y recopiait l'URL complète dans `?callbackUrl=` lors de la
 * redirection vers /admin/login. On ne manipule donc que des CHEMINS (`/admin/...`) :
 * ils sont indépendants de l'hôte, et on refuse tout ce qui ne mène pas au backoffice
 * (pas de redirection ouverte).
 *
 * Fichier sans dépendance Node : il est importé par le middleware (Edge) et par le
 * formulaire de connexion (navigateur).
 */

export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/login";

/** Caractères de contrôle, et antislash (certains navigateurs le lisent comme « / »). */
const FORBIDDEN_CHARS = /[\u0000-\u001f\u007f\\]/;

const PLACEHOLDER_ORIGIN = "http://admin-callback.invalid";

function isAdminPath(path: string): boolean {
  return path === ADMIN_HOME || path.startsWith(`${ADMIN_HOME}/`) || path.startsWith(`${ADMIN_HOME}?`) || path.startsWith(`${ADMIN_HOME}#`);
}

/**
 * Renvoie un chemin du backoffice (`/admin`, `/admin/posts?page=2`…), ou `null`.
 *
 * Accepte :
 *  - un chemin relatif commençant par « /admin » ;
 *  - une URL absolue SEULEMENT si son origine figure dans `allowedOrigins`
 *    (on n'en garde alors que chemin + paramètres).
 * Refuse tout le reste : autre section du site, URL de protocole relatif (`//x`),
 * autre domaine, `javascript:`, caractères de contrôle…
 */
export function normalizeAdminPath(
  raw: string | null | undefined,
  allowedOrigins: readonly string[] = [],
): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048 || FORBIDDEN_CHARS.test(value)) return null;

  if (value.startsWith("/")) {
    if (value.startsWith("//")) return null;
    // Résolution par le parseur d'URL : neutralise « /admin/../autre », « /admin/%2e%2e/… ».
    try {
      const url = new URL(value, PLACEHOLDER_ORIGIN);
      if (url.origin !== PLACEHOLDER_ORIGIN) return null;
      const path = `${url.pathname}${url.search}${url.hash}`;
      return isAdminPath(path) ? path : null;
    } catch {
      return null;
    }
  }

  // URL absolue : uniquement si l'origine est connue et de confiance.
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!allowedOrigins.includes(url.origin)) return null;
    const path = `${url.pathname}${url.search}`;
    return isAdminPath(path) ? path : null;
  } catch {
    return null;
  }
}

/**
 * Cible après connexion : un chemin du backoffice, jamais la page de connexion
 * elle-même (boucle). Par défaut : /admin.
 */
export function safeCallbackPath(
  raw: string | null | undefined,
  allowedOrigins: readonly string[] = [],
): string {
  const path = normalizeAdminPath(raw, allowedOrigins);
  if (!path) return ADMIN_HOME;
  const pathname = path.split(/[?#]/, 1)[0];
  if (pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)) return ADMIN_HOME;
  return path;
}

/** Chemin de la page de connexion avec la page demandée en `callbackUrl` (chemin seul). */
export function buildLoginPath(pathname: string, search = ""): string {
  const target = safeCallbackPath(`${pathname}${search}`);
  return `${ADMIN_LOGIN}?callbackUrl=${encodeURIComponent(target)}`;
}

/**
 * Origines de confiance du site public, pour reconnaître d'anciens liens absolus
 * (ex. `https://allianceconsultants.net/admin/posts`). Les adresses internes
 * (`http://<conteneur>:3000`) n'en font volontairement pas partie.
 */
export function trustedOrigins(...candidates: Array<string | null | undefined>): string[] {
  const origins = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      /* ignore */
    }
  }
  return [...origins];
}
