import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import nextConfig from "../../next.config";

// Même moteur de motifs que Next pour les `source` de redirections (pas de types fournis).
const { pathToRegexp } = createRequire(import.meta.url)(
  "next/dist/compiled/path-to-regexp",
) as { pathToRegexp: (source: string) => RegExp };

type Redirect = {
  source: string;
  destination: string;
  permanent?: boolean;
  missing?: unknown[];
};

async function redirects(): Promise<Redirect[]> {
  return (await nextConfig.redirects!()) as Redirect[];
}

const list = await redirects();

describe("next.config — redirections", () => {
  it("/formation (ancienne page) → /formations, en un seul saut, y compris avec barre finale", async () => {
    const rule = list.find((r) => r.source === "/formation");
    expect(rule).toMatchObject({ destination: "/formations", permanent: true });
    // Les règles s'appliquent dans l'ordre : celle-ci doit précéder la règle générale de barre finale.
    const trailing = list.findIndex((r) => r.destination === "/:path");
    expect(list.indexOf(rule!)).toBeLessThan(trailing);
  });

  it("désactive la redirection de barre finale native (refaite dans redirects())", () => {
    expect(nextConfig.skipTrailingSlashRedirect).toBe(true);
  });

  describe("redirection de la barre finale", () => {
    const rule = list.find((r) => r.destination === "/:path")!;
    const re = pathToRegexp(rule.source);

    it("exige de ne pas intercepter ?replytocom (410 direct)", () => {
      expect(rule.missing).toEqual([{ type: "query", key: "replytocom" }]);
    });

    it.each(["/blog/", "/blog/tags/ia/", "/a-propos/", "/admin/", "/formations/", "/tags/x/", "/feed.xml/"])(
      "redirige %s vers la même URL sans barre",
      (p) => {
        expect(re.test(p)).toBe(true);
      },
    );

    it.each([
      "/tag/",
      "/tag/x/",
      "/tag/digital-marketing/feed/",
      "/author/iris_kone/",
      "/author/iris_kone/feed/",
      "/category/news/",
      "/feed/",
      "/comments/feed/",
      "/blog/un-article/feed/",
      "/wp-admin/",
      "/wp-content/uploads/",
      "/xmlrpc.php/",
    ])("laisse %s au middleware (410 sans redirection)", (p) => {
      expect(re.test(p)).toBe(false);
    });

    it("n'attrape pas les URL sans barre finale", () => {
      expect(re.test("/blog")).toBe(false);
      expect(re.test("/")).toBe(false);
    });
  });
});
