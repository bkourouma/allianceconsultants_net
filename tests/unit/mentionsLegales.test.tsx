import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

import MentionsLegalesPage, { generateMetadata } from "@/app/(site)/mentions-legales/page";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { getSiteSettings } from "@/lib/content";

describe("page /mentions-legales", () => {
  it("affiche le titre, les sections, l'identité légale et les liens", async () => {
    const html = renderToStaticMarkup(await MentionsLegalesPage());
    expect(html).toContain("<h1");
    expect(html).toContain("Mentions légales");
    for (const section of ["Éditeur du site", "Hébergement", "Propriété intellectuelle", "Données personnelles"]) {
      expect(html).toContain(section);
    }
    expect(html).toContain("CI-ABJ-2014-B-20956");
    expect(html).toContain("1438224 S");
    expect(html).toContain("Baba KOUROUMA");
    expect(html).toContain("ALLIANCE COMPUTER CONSULTANTS");
    expect(html).toContain("société à responsabilité limitée (SARL)");
    expect(html).toContain("3 000 000 FCFA");
    expect(html).toContain("Abidjan Cocody, II Plateaux Sideci Zoo, 18 BP 318");
    expect(html).toContain("Associé-Gérant");
    expect(html).not.toContain("tel:");
    expect(html).not.toContain("Téléphone");
    expect(html).toContain("Hostinger International Ltd.");
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="mailto:info@allianceconsultants.net"');
    expect(html).toContain("23 octobre 2026");
  });

  it("déclare une adresse canonique", async () => {
    const meta = await generateMetadata();
    expect(meta.alternates?.canonical).toMatch(/\/mentions-legales$/);
  });
});

describe("pied de page : mentions légales", () => {
  it("lie /mentions-legales", async () => {
    const settings = await getSiteSettings();
    const html = renderToStaticMarkup(<GlobalFooter settings={settings} />);
    expect(html).toContain('href="/mentions-legales"');
    expect(html).toContain("Mentions légales");
  });
});
