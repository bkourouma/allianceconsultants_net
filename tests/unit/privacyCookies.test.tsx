import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

import PrivacyPage from "@/app/(site)/privacy/page";

describe("politique de confidentialité : cookies et traceurs", () => {
  it("mentionne Umami sans cookie, GA4, Google Ireland, les cookies _ga et le lien « Gérer mes cookies »", async () => {
    const html = renderToStaticMarkup(await PrivacyPage());
    expect(html).toContain("Umami");
    expect(html).toContain("sans cookie");
    expect(html).toContain("Google Analytics 4");
    expect(html).toContain("Google Ireland Limited");
    expect(html).toContain("<code>_ga</code>");
    expect(html).toContain("_ga_&lt;identifiant&gt;");
    expect(html).toContain("d&#x27;une durée de 13");
    expect(html).toMatch(/\(Umami\)[^<]*?13 mois maximum/s);
    expect(html).toContain("voir la section 8");
    expect(html).toContain("ac_consent");
    expect(html).toContain("Gérer mes cookies");
  });
});
