import { NextRequest } from "next/server";

/**
 * Origine PUBLIQUE d'une requête (ex. https://allianceconsultants.net).
 *
 * Derrière Docker, `request.url` n'a pas l'adresse publique : le serveur standalone de
 * Next la construit avec `HOSTNAME` (= identifiant du conteneur, ex. 013da9911305) et le
 * port interne, quel que soit l'en-tête `Host` reçu. Tout ce qui reconstruit une URL à
 * partir de `request.url` (redirections, NextAuth…) produit alors
 * `http://013da9911305:3000/...`. On reprend donc l'hôte et le schéma indiqués par le
 * proxy (X-Forwarded-Host / Host, X-Forwarded-Proto), comme le fait déjà NextAuth côté
 * middleware et composants serveur (createActionURL) — les deux doivent rester d'accord,
 * sinon le nom du cookie de session (préfixe __Secure- en https) ne correspond plus.
 */

/** Hôte DNS ou IPv4/IPv6 entre crochets, avec port facultatif. Rien d'autre. */
const HOST_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*|\[[0-9a-f:.]+\])(?::\d{1,5})?$/i;

function firstValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first ? first : null;
}

export function publicOrigin(headers: Headers, fallbackOrigin: string): string {
  const fallback = new URL(fallbackOrigin);

  const host = firstValue(headers.get("x-forwarded-host")) ?? firstValue(headers.get("host"));
  const rawProto = firstValue(headers.get("x-forwarded-proto"))?.replace(/:$/, "").toLowerCase();

  const protocol =
    rawProto === "http" || rawProto === "https" ? `${rawProto}:` : fallback.protocol;

  if (!host || !HOST_PATTERN.test(host)) {
    return `${protocol}//${fallback.host}`;
  }
  return `${protocol}//${host}`;
}

/** Même requête, avec l'origine publique à la place de l'origine interne du conteneur. */
export function withPublicOrigin(req: NextRequest): NextRequest {
  const { href, origin } = req.nextUrl;
  const wanted = publicOrigin(req.headers, origin);
  if (wanted === origin) return req;
  return new NextRequest(href.replace(origin, wanted), req);
}

/**
 * Redirection vers un CHEMIN du site, en `Location` relatif (ex. `/contact-recu`).
 *
 * `NextResponse.redirect()` exige une URL absolue, donc une origine : or `request.url`
 * porte l'hôte interne du conteneur (voir plus haut). Le navigateur résout un `Location`
 * relatif (RFC 9110 §10.2.2) par rapport à l'adresse qu'il vient d'appeler : aucune
 * dépendance aux en-têtes du proxy, donc aucune adresse interne qui fuite.
 *
 * Seuls les chemins internes sont acceptés (pas de `//hôte`, de `/\hôte` ni de schéma) :
 * pas de redirection ouverte, même si le chemin venait un jour d'une saisie.
 */
export function redirectToPath(path: string, status: 301 | 302 | 303 | 307 | 308 = 303): Response {
  const safe = isInternalPath(path) ? path : "/";
  return new Response(null, { status, headers: { Location: safe } });
}

function isInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return false;
  return !/[\u0000-\u001f\u007f]/.test(path);
}
