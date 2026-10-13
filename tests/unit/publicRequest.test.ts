import { describe, expect, it } from "vitest";
import { publicOrigin, redirectToPath } from "@/lib/public-request";

describe("redirectToPath — redirection en chemin relatif", () => {
  it("renvoie un 303 avec un Location relatif, sans origine", () => {
    const res = redirectToPath("/contact-recu");
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/contact-recu");
  });

  it("conserve la requête (query string) et accepte un autre code", () => {
    const res = redirectToPath("/contact-erreur?reason=validation", 307);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("/contact-erreur?reason=validation");
  });

  it.each([
    "//evil.example",
    "/" + String.fromCharCode(92) + "evil.example",
    "https://evil.example/x",
    "javascript:alert(1)",
    "contact-recu",
    "",
    "/ok\r\nSet-Cookie: a=b",
  ])("refuse la redirection ouverte %j (repli sur /)", (path) => {
    expect(redirectToPath(path).headers.get("location")).toBe("/");
  });
});

describe("publicOrigin", () => {
  it("préfère l'hôte du proxy à l'hôte interne du conteneur", () => {
    const headers = new Headers({ host: "allianceconsultants.net", "x-forwarded-proto": "https" });
    expect(publicOrigin(headers, "http://013da9911305:3000")).toBe("https://allianceconsultants.net");
  });
});
