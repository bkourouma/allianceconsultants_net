import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RichText } from "@/components/assistant/RichText";

/** Rend le composant puis le relit comme un navigateur le ferait : si du HTML s'était glissé, il serait interprété. */
function render(text: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<RichText text={text} />);
  return container;
}

describe("RichText (messages de l'assistant)", () => {
  it("rend gras, listes et liens internes", () => {
    const container = render(
      "CliniquePro réunit **agenda** et **caisse**. Voir [la page](/solutions/cliniquepro).\n\n- Dossier patient\n- Agenda partagé\n- Honoraires",
    );
    expect(container.querySelectorAll("strong")).toHaveLength(2);
    expect(container.querySelector('a[href="/solutions/cliniquepro"]')).not.toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(3);
  });

  it("n'interprète jamais de HTML", () => {
    const container = render('<img src=x onerror="alert(1)"> <script>alert(1)</script>');
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("<script>");
  });

  it.each([
    ["javascript:alert(1)"],
    ["data:text/html;base64,PHNjcmlwdD4="],
    ["//evil.example/phish"],
    ["https://evil.example/phish"],
    ["http://allianceconsultants.net/non-securise"],
  ])("ne rend pas cliquable le lien %s", (href) => {
    const container = render(`[cliquez ici](${href})`);
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toBe("cliquez ici");
  });

  it("autorise les domaines d'Alliance Consultants en https, dans un nouvel onglet isolé", () => {
    const container = render(
      "[CliniquePro](https://cliniquepro.allianceconsultants.net/) et [Calendly](https://calendly.com/x/y)",
    );
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);
    for (const a of Array.from(links)) {
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
    }
  });
});
