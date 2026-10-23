import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { getSiteSettings } from "@/lib/content";

describe("pied de page : Gérer mes cookies", () => {
  it("affiche le bouton quand le menu légal est vide, absent ou rempli", async () => {
    const settings = await getSiteSettings();
    for (const legal of [[], undefined, [{ label: "Confidentialité", href: "/privacy" }]]) {
      const html = renderToStaticMarkup(
        <GlobalFooter settings={{ ...settings, footerMenu: { ...settings.footerMenu, legal: legal as never } }} />,
      );
      expect(html).toContain("Gérer mes cookies");
      expect(html).toContain("cursor-pointer");
    }
  });
});
