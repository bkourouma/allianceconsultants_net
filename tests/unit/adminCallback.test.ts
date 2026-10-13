import { describe, expect, it } from "vitest";
import {
  buildLoginPath,
  normalizeAdminPath,
  safeCallbackPath,
  trustedOrigins,
} from "@/lib/admin-callback";
import { authConfig } from "@/lib/auth.config";
import { publicOrigin } from "@/lib/public-request";

const PUBLIC = "https://allianceconsultants.net";
const INTERNAL = "http://013da9911305:3000";

describe("buildLoginPath — callbackUrl réduite au chemin", () => {
  it("/admin → /admin/login?callbackUrl=%2Fadmin", () => {
    expect(buildLoginPath("/admin")).toBe("/admin/login?callbackUrl=%2Fadmin");
  });

  it("conserve les sous-pages et les paramètres", () => {
    expect(buildLoginPath("/admin/posts", "?page=2&q=ged")).toBe(
      "/admin/login?callbackUrl=%2Fadmin%2Fposts%3Fpage%3D2%26q%3Dged",
    );
  });

  it("ne contient jamais d'hôte ni de protocole", () => {
    expect(buildLoginPath("/admin/posts")).not.toMatch(/http|%3A%2F%2F|:3000/i);
  });

  it("n'emboîte pas la page de connexion dans elle-même", () => {
    expect(buildLoginPath("/admin/login")).toBe("/admin/login?callbackUrl=%2Fadmin");
  });
});

describe("normalizeAdminPath / safeCallbackPath", () => {
  const origins = trustedOrigins(PUBLIC);

  it.each([
    ["/admin", "/admin"],
    ["/admin/", "/admin/"],
    ["/admin/posts?page=2", "/admin/posts?page=2"],
    ["/admin/posts/abc/edit", "/admin/posts/abc/edit"],
    [`${PUBLIC}/admin/posts`, "/admin/posts"],
    [`${PUBLIC}/admin?x=1`, "/admin?x=1"],
  ])("accepte %s", (input, expected) => {
    expect(normalizeAdminPath(input, origins)).toBe(expected);
  });

  it.each([
    ["adresse interne du conteneur", `${INTERNAL}/admin`],
    ["autre domaine", "https://evil.example/admin"],
    ["autre domaine, même préfixe", "https://allianceconsultants.net.evil.example/admin"],
    ["protocole relatif", "//evil.example/admin"],
    ["protocole relatif avec antislash", "/\evil.example"],
    ["javascript:", "javascript:alert(1)"],
    ["data:", "data:text/html,<script>1</script>"],
    ["autre section du site", "/blog"],
    ["préfixe trompeur", "/administrateur"],
    ["remontée de dossier", "/admin/../blog"],
    ["remontée encodée", "/admin/%2e%2e/blog"],
    ["retour à la ligne", "/admin\r\nLocation: https://evil.example"],
    ["vide", ""],
    ["trop long", `/admin/${"a".repeat(3000)}`],
  ])("refuse : %s", (_label, input) => {
    expect(normalizeAdminPath(input, origins)).toBeNull();
    expect(safeCallbackPath(input, origins)).toBe("/admin");
  });

  it("valeurs absentes → /admin", () => {
    expect(safeCallbackPath(null)).toBe("/admin");
    expect(safeCallbackPath(undefined)).toBe("/admin");
  });

  it("n'accepte pas de revenir sur la page de connexion après connexion", () => {
    expect(safeCallbackPath("/admin/login")).toBe("/admin");
    expect(safeCallbackPath("/admin/login?callbackUrl=%2Fadmin")).toBe("/admin");
    // …mais NextAuth peut y renvoyer après une déconnexion
    expect(normalizeAdminPath("/admin/login")).toBe("/admin/login");
  });
});

describe("authConfig.callbacks.authorized — redirection vers la connexion", () => {
  const authorized = authConfig.callbacks.authorized;

  function run(url: string, loggedIn = false) {
    return authorized({
      auth: loggedIn ? ({ user: { id: "1" } } as never) : null,
      request: { nextUrl: new URL(url) } as never,
    });
  }

  it("non connecté sur /admin : 307 vers /admin/login?callbackUrl=%2Fadmin, sans hôte interne", async () => {
    const res = (await run(`${INTERNAL}/admin`)) as Response;
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("Location") ?? "");
    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("callbackUrl")).toBe("/admin");
    // L'hôte interne ne doit pas se retrouver dans le paramètre callbackUrl.
    expect(location.search).toBe("?callbackUrl=%2Fadmin");
  });

  it("conserve la sous-page demandée", async () => {
    const res = (await run(`${INTERNAL}/admin/posts?page=2`)) as Response;
    expect(new URL(res.headers.get("Location") ?? "").searchParams.get("callbackUrl")).toBe(
      "/admin/posts?page=2",
    );
  });

  it("connecté : accès autorisé", async () => {
    expect(await run(`${INTERNAL}/admin/posts`, true)).toBe(true);
  });

  it("page de connexion : accessible si non connecté, renvoie vers /admin si connecté", async () => {
    expect(await run(`${INTERNAL}/admin/login`)).toBe(true);
    const res = (await run(`${INTERNAL}/admin/login`, true)) as Response;
    expect(new URL(res.headers.get("Location") ?? "").pathname).toBe("/admin");
  });
});

describe("authConfig.callbacks.redirect — après connexion / déconnexion", () => {
  const redirect = authConfig.callbacks.redirect;
  const baseUrl = PUBLIC;

  it("chemin du backoffice → même chemin sur l'origine publique", async () => {
    expect(await redirect({ url: "/admin/posts", baseUrl })).toBe(`${PUBLIC}/admin/posts`);
    expect(await redirect({ url: "/admin/login", baseUrl })).toBe(`${PUBLIC}/admin/login`);
  });

  it("URL absolue de l'origine publique → conservée", async () => {
    expect(await redirect({ url: `${PUBLIC}/admin/posts`, baseUrl })).toBe(`${PUBLIC}/admin/posts`);
  });

  it.each([
    `${INTERNAL}/admin`,
    "https://evil.example/admin",
    "//evil.example",
    "/blog",
    "javascript:alert(1)",
  ])("refuse %s → /admin sur l'origine publique", async (url) => {
    expect(await redirect({ url, baseUrl })).toBe(`${PUBLIC}/admin`);
  });
});

describe("publicOrigin — origine publique derrière le proxy", () => {
  const h = (init: Record<string, string>) => new Headers(init);

  it("reprend l'hôte et le schéma du proxy", () => {
    expect(
      publicOrigin(h({ "x-forwarded-host": "allianceconsultants.net", "x-forwarded-proto": "https" }), INTERNAL),
    ).toBe(PUBLIC);
  });

  it("à défaut de X-Forwarded-Host, utilise Host (schéma interne conservé)", () => {
    expect(publicOrigin(h({ host: "allianceconsultants.net" }), INTERNAL)).toBe(
      "http://allianceconsultants.net",
    );
  });

  it("prend la première valeur d'une liste", () => {
    expect(
      publicOrigin(h({ "x-forwarded-host": "allianceconsultants.net, 10.0.0.2", "x-forwarded-proto": "https, http" }), INTERNAL),
    ).toBe(PUBLIC);
  });

  it("sans en-têtes : origine de la requête", () => {
    expect(publicOrigin(h({}), INTERNAL)).toBe(INTERNAL);
  });

  it.each(["evil.example/path", "a b", "a@b.example", "http://x.example", ""])(
    "ignore un hôte invalide (%j)",
    (bad) => {
      expect(publicOrigin(h({ "x-forwarded-host": bad }), INTERNAL)).toBe(INTERNAL);
    },
  );

  it("ignore un schéma inconnu", () => {
    expect(publicOrigin(h({ "x-forwarded-host": "allianceconsultants.net", "x-forwarded-proto": "javascript" }), INTERNAL)).toBe(
      "http://allianceconsultants.net",
    );
  });
});
