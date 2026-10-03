import { describe, it, expect } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { ChatState } from "@/lib/assistant/protocol";
import { ASSISTANT_TOOLS, actionsFromContent } from "@/lib/assistant/tools";

const fresh: ChatState = {
  contactFormShown: false,
  contactCaptured: false,
  bookingShown: false,
  bookingDone: false,
};

function tool(name: string, input: unknown): Anthropic.ToolUseBlock {
  return { type: "tool_use", id: `toolu_${name}`, name, input } as Anthropic.ToolUseBlock;
}
const text = { type: "text", text: "Bonjour", citations: null } as Anthropic.TextBlock;

describe("ASSISTANT_TOOLS", () => {
  it("n'expose que des outils d'interface (aucun outil d'écriture)", () => {
    expect(ASSISTANT_TOOLS.map((t) => t.name).sort()).toEqual([
      "show_contact_form",
      "show_demo_booking",
      "suggest_replies",
    ]);
  });
});

describe("actionsFromContent", () => {
  it("transforme suggest_replies en réponses rapides", () => {
    const out = actionsFromContent([text, tool("suggest_replies", { replies: ["Oui", "Non"] })], fresh);
    expect(out).toEqual([{ type: "replies", replies: ["Oui", "Non"] }]);
  });

  it("affiche le formulaire de coordonnées avec le résumé", () => {
    const out = actionsFromContent([tool("show_contact_form", { summary: "Directeur de clinique." })], fresh);
    expect(out).toEqual([{ type: "contact_form", summary: "Directeur de clinique." }]);
  });

  it("le formulaire passe avant les réponses rapides (une seule action par tour)", () => {
    const out = actionsFromContent(
      [tool("suggest_replies", { replies: ["a", "b"] }), tool("show_contact_form", { summary: "Résumé." })],
      fresh,
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ type: "contact_form" });
  });

  it("ne réaffiche pas le formulaire s'il a déjà été montré, ni si les coordonnées sont recueillies", () => {
    const call = [tool("show_contact_form", { summary: "Résumé." })];
    expect(actionsFromContent(call, { ...fresh, contactFormShown: true })).toEqual([]);
    // Coordonnées déjà recueillies : on bascule vers la réservation.
    expect(actionsFromContent(call, { ...fresh, contactFormShown: true, contactCaptured: true })).toEqual([
      { type: "demo_booking" },
    ]);
  });

  it("ouvre la réservation sur demande, sauf si la démo est déjà réservée", () => {
    const call = [tool("show_demo_booking", {})];
    expect(actionsFromContent(call, fresh)).toEqual([{ type: "demo_booking" }]);
    expect(actionsFromContent(call, { ...fresh, bookingDone: true })).toEqual([]);
  });

  it("ignore les entrées d'outil invalides (pas de réponses vides, résumé manquant, trop de choix)", () => {
    expect(actionsFromContent([tool("suggest_replies", { replies: [] })], fresh)).toEqual([]);
    expect(actionsFromContent([tool("suggest_replies", { replies: ["a", "b", "c", "d", "e"] })], fresh)).toEqual([]);
    expect(actionsFromContent([tool("show_contact_form", {})], fresh)).toEqual([]);
    expect(actionsFromContent([tool("show_contact_form", { summary: "x".repeat(901) })], fresh)).toEqual([]);
    expect(actionsFromContent([tool("outil_inconnu", {})], fresh)).toEqual([]);
  });

  it("ne renvoie rien pour une réponse purement textuelle", () => {
    expect(actionsFromContent([text], fresh)).toEqual([]);
  });
});
