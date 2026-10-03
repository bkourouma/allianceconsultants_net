import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Le SDK Anthropic est remplacé : on vérifie ce que la route lui envoie et ce qu'elle renvoie au navigateur.
const streamMock = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status = 500;
  }
  class Anthropic {
    static APIError = APIError;
    messages = { stream: (...args: unknown[]) => streamMock(...args) };
  }
  return { default: Anthropic };
});

type FinalMessage = {
  content: unknown[];
  stop_reason: string;
  model: string;
  usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens: number };
};

function fakeStream(deltas: string[], final: FinalMessage | Error) {
  const handlers: Record<string, (d: string) => void> = {};
  return {
    on(event: string, cb: (d: string) => void) {
      handlers[event] = cb;
      return this;
    },
    abort: vi.fn(),
    async finalMessage() {
      if (final instanceof Error) throw final;
      for (const d of deltas) handlers.text?.(d);
      return final;
    },
  };
}

const okFinal = (content: unknown[], stop = "tool_use"): FinalMessage => ({
  content,
  stop_reason: stop,
  model: "claude-opus-5-5",
  usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 },
});

const state = { contactFormShown: false, contactCaptured: false, bookingShown: false, bookingDone: false };

const validBody = {
  messages: [
    { role: "assistant", content: "Bonjour, vous dirigez une clinique ?" },
    { role: "user", content: "Oui, avec 4 médecins." },
  ],
  topicId: "solutions/cliniquepro",
  journey: [{ id: "solutions/cliniquepro", seconds: 40, scroll: 0.7 }],
  state,
};

let ipCounter = 0;
function request(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return new NextRequest("http://localhost:3000/api/assistant/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "localhost:3000",
      "x-forwarded-for": `10.9.0.${ipCounter}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function loadRoute() {
  vi.resetModules();
  return (await import("@/app/api/assistant/chat/route")).POST;
}

async function events(res: Response) {
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { t: string; d?: string; actions?: unknown[]; code?: string });
}

const ENV_KEYS = ["ANTHROPIC_API_KEY", "ASSISTANT_MODEL", "ASSISTANT_RATE_LIMIT_PER_10MIN", "ASSISTANT_DAILY_CAP"];
let savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  streamMock.mockReset();
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  process.env.ANTHROPIC_API_KEY = "test-key";
  delete process.env.ASSISTANT_MODEL;
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.restoreAllMocks();
});

describe("POST /api/assistant/chat — garde-fous", () => {
  it("répond 503 sans clé API (le widget bascule sur le formulaire)", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const POST = await loadRoute();
    const res = await POST(request(validBody));
    expect(res.status).toBe(503);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it("refuse un appel venu d'un autre site", async () => {
    const POST = await loadRoute();
    const res = await POST(request(validBody, { origin: "https://autre-site.example" }));
    expect(res.status).toBe(403);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it("accepte l'origine du site", async () => {
    streamMock.mockReturnValue(fakeStream(["Ok"], okFinal([{ type: "text", text: "Ok" }], "end_turn")));
    const POST = await loadRoute();
    const res = await POST(request(validBody, { origin: "http://localhost:3000" }));
    expect(res.status).toBe(200);
  });

  it.each([
    ["JSON illisible", "{pas du json"],
    ["schéma invalide", { ...validBody, topicId: "../../etc" }],
    ["dernier message de l'assistant", { ...validBody, messages: [{ role: "user", content: "a" }, { role: "assistant", content: "b" }] }],
    ["message utilisateur trop long", { ...validBody, messages: [{ role: "user", content: "x".repeat(1001) }] }],
  ])("répond 400 : %s", async (_label, body) => {
    const POST = await loadRoute();
    const res = await POST(request(body));
    expect(res.status).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it("limite le débit par adresse IP", async () => {
    process.env.ASSISTANT_RATE_LIMIT_PER_10MIN = "2";
    streamMock.mockImplementation(() => fakeStream(["Ok"], okFinal([{ type: "text", text: "Ok" }], "end_turn")));
    const POST = await loadRoute();
    const same = { "x-forwarded-for": "10.77.0.1" };
    expect((await POST(request(validBody, same))).status).toBe(200);
    expect((await POST(request(validBody, same))).status).toBe(200);
    expect((await POST(request(validBody, same))).status).toBe(429);
  });

  it("applique un plafond quotidien global", async () => {
    process.env.ASSISTANT_DAILY_CAP = "1";
    streamMock.mockImplementation(() => fakeStream(["Ok"], okFinal([{ type: "text", text: "Ok" }], "end_turn")));
    const POST = await loadRoute();
    expect((await POST(request(validBody))).status).toBe(200);
    expect((await POST(request(validBody))).status).toBe(429);
  });
});

describe("POST /api/assistant/chat — appel au modèle", () => {
  it("envoie un prompt mis en cache, des outils d'interface et un historique commençant par le visiteur", async () => {
    streamMock.mockReturnValue(
      fakeStream(["Merci. ", "Combien de médecins ?"], okFinal([
        { type: "text", text: "Merci. Combien de médecins ?" },
        { type: "tool_use", id: "t1", name: "suggest_replies", input: { replies: ["1 à 3", "4 à 10"] } },
      ])),
    );
    const POST = await loadRoute();
    const res = await POST(request(validBody));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/x-ndjson");
    expect(res.headers.get("x-accel-buffering")).toBe("no");

    const params = streamMock.mock.calls[0]![0] as {
      model: string;
      max_tokens: number;
      output_config?: { effort: string };
      tool_choice: { type: string };
      tools: { name: string }[];
      system: { text: string; cache_control?: { type: string } }[];
      messages: { role: string; content: string }[];
    };
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.output_config).toEqual({ effort: "low" });
    expect(params.tool_choice).toEqual({ type: "auto" });
    expect(params.tools.map((t) => t.name)).toEqual(["suggest_replies", "show_contact_form", "show_demo_booking"]);
    // Partie stable en cache, contexte visiteur après.
    expect(params.system[0]!.cache_control).toEqual({ type: "ephemeral" });
    expect(params.system[1]!.cache_control).toBeUndefined();
    expect(params.system[1]!.text).toContain("CliniquePro");
    expect(params.system[1]!.text).toContain("Bonjour, vous dirigez une clinique ?");
    // L'ouverture statique (rôle assistant) est sortie de l'historique : le premier message est celui du visiteur.
    expect(params.messages).toEqual([{ role: "user", content: "Oui, avec 4 médecins." }]);

    const out = await events(res);
    expect(out.filter((e) => e.t === "text").map((e) => e.d).join("")).toBe("Merci. Combien de médecins ?");
    expect(out.find((e) => e.t === "actions")?.actions).toEqual([{ type: "replies", replies: ["1 à 3", "4 à 10"] }]);
    expect(out[out.length - 1]).toEqual({ t: "done" });
  });

  it("n'ajoute pas `effort` pour un modèle qui ne le supporte pas", async () => {
    process.env.ASSISTANT_MODEL = "claude-haiku-4-5";
    streamMock.mockReturnValue(fakeStream(["Ok"], okFinal([{ type: "text", text: "Ok" }], "end_turn")));
    const POST = await loadRoute();
    await (await POST(request(validBody))).text();
    const params = streamMock.mock.calls[0]![0] as { model: string; output_config?: unknown };
    expect(params.model).toBe("claude-haiku-4-5");
    expect(params.output_config).toBeUndefined();
  });

  it("applique l'état : pas de formulaire si les coordonnées sont déjà recueillies", async () => {
    streamMock.mockReturnValue(
      fakeStream(["Voici"], okFinal([
        { type: "text", text: "Voici" },
        { type: "tool_use", id: "t1", name: "show_contact_form", input: { summary: "Résumé." } },
      ])),
    );
    const POST = await loadRoute();
    const res = await POST(
      request({ ...validBody, state: { ...state, contactFormShown: true, contactCaptured: true } }),
    );
    const out = await events(res);
    expect(out.find((e) => e.t === "actions")?.actions).toEqual([{ type: "demo_booking" }]);
  });

  it("signale un refus du modèle sans exposer de détail", async () => {
    streamMock.mockReturnValue(fakeStream([], okFinal([], "refusal")));
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "refused" }]);
  });

  it("signale une panne du service et ne journalise aucune donnée du visiteur", async () => {
    const Anthropic = (await import("@anthropic-ai/sdk")).default as unknown as { APIError: new () => Error };
    streamMock.mockReturnValue(fakeStream([], new Anthropic.APIError()));
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "unavailable" }]);

    const logged = JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).not.toContain("médecins");
  });

  it("traite une réponse vide comme une panne", async () => {
    streamMock.mockReturnValue(fakeStream([], okFinal([], "end_turn")));
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "unavailable" }]);
  });
});
