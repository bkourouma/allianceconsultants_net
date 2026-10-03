import { describe, it, expect } from "vitest";
import type { ToolCall } from "@/lib/assistant/openrouter";
import type { ChatState } from "@/lib/assistant/protocol";
import { ASSISTANT_TOOLS, actionsFromToolCalls } from "@/lib/assistant/tools";

const fresh: ChatState = {
  contactFormShown: false,
  contactCaptured: false,
  bookingShown: false,
  bookingDone: false,
};

const call = (name: string, input: unknown): ToolCall => ({
  name,
  arguments: typeof input === "string" ? input : JSON.stringify(input),
});

describe("ASSISTANT_TOOLS", () => {
  it("n'expose que des outils d'interface (aucun outil d'écriture)", () => {
    expect(ASSISTANT_TOOLS.map((t) => t.function.name).sort()).toEqual([
      "show_contact_form",
      "show_demo_booking",
      "suggest_replies",
    ]);
  });

  it("respecte le format de fonctions attendu par OpenRouter", () => {
    for (const tool of ASSISTANT_TOOLS) {
      expect(tool.type).toBe("function");
      expect(tool.function.description.length).toBeGreaterThan(20);
      expect(tool.function.parameters).toMatchObject({ type: "object" });
    }
  });
});

describe("actionsFromToolCalls", () => {
  it("transforme suggest_replies en réponses rapides", () => {
    const out = actionsFromToolCalls([call("suggest_replies", { replies: ["Oui", "Non"] })], fresh);
    expect(out).toEqual([{ type: "replies", replies: ["Oui", "Non"] }]);
  });

  it("affiche le formulaire de coordonnées avec le résumé", () => {
    const out = actionsFromToolCalls([call("show_contact_form", { summary: "Directeur de clinique." })], fresh);
    expect(out).toEqual([{ type: "contact_form", summary: "Directeur de clinique." }]);
  });

  it("le formulaire passe avant les réponses rapides (une seule action par tour)", () => {
    const out = actionsFromToolCalls(
      [call("suggest_replies", { replies: ["a", "b"] }), call("show_contact_form", { summary: "Résumé." })],
      fresh,
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ type: "contact_form" });
  });

  it("ne réaffiche pas le formulaire s'il a déjà été montré, ni si les coordonnées sont recueillies", () => {
    const calls = [call("show_contact_form", { summary: "Résumé." })];
    expect(actionsFromToolCalls(calls, { ...fresh, contactFormShown: true })).toEqual([]);
    // Coordonnées déjà recueillies : on bascule vers la réservation.
    expect(actionsFromToolCalls(calls, { ...fresh, contactFormShown: true, contactCaptured: true })).toEqual([
      { type: "demo_booking" },
    ]);
  });

  it("ouvre la réservation sur demande (arguments vides ou {}), sauf si la démo est déjà réservée", () => {
    expect(actionsFromToolCalls([call("show_demo_booking", "")], fresh)).toEqual([{ type: "demo_booking" }]);
    expect(actionsFromToolCalls([call("show_demo_booking", {})], fresh)).toEqual([{ type: "demo_booking" }]);
    expect(actionsFromToolCalls([call("show_demo_booking", {})], { ...fresh, bookingDone: true })).toEqual([]);
  });

  it("ignore les entrées invalides : JSON tronqué, mauvais types, trop de choix, trop long, outil inconnu", () => {
    expect(actionsFromToolCalls([call("suggest_replies", '{"replies": ["a", "b"')], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("suggest_replies", { replies: [] })], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("suggest_replies", { replies: "oui" })], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("suggest_replies", { replies: ["a", "b", "c", "d", "e"] })], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("show_contact_form", {})], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("show_contact_form", { summary: "x".repeat(901) })], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("show_demo_booking", "{pas du json")], fresh)).toEqual([]);
    expect(actionsFromToolCalls([call("outil_inconnu", {})], fresh)).toEqual([]);
  });

  it("ne renvoie rien sans appel d'outil", () => {
    expect(actionsFromToolCalls([], fresh)).toEqual([]);
  });
});
