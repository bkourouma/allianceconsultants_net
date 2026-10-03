import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// OpenRouter est simulé : on vérifie ce que la route lui envoie et ce qu'elle renvoie au navigateur.
const fetchMock = vi.fn();

const data = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;
const chunk = (delta: Record<string, unknown>, finish: string | null = null) =>
  data({ model: "deepseek/deepseek-v4-flash", choices: [{ delta, finish_reason: finish }] });

function sse(...parts: string[]) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const part of parts) controller.enqueue(encoder.encode(part));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    }),
    { status: 200, headers: { "content-type": "text/event-stream" } },
  );
}

const textReply = (text: string) => sse(chunk({ content: text }), chunk({}, "stop"));

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

/** Corps JSON de la dernière requête envoyée à OpenRouter. */
function sentBody() {
  const init = fetchMock.mock.calls[0]![1] as RequestInit;
  return JSON.parse(init.body as string) as {
    model: string;
    max_tokens: number;
    tool_choice: string;
    stream: boolean;
    reasoning: unknown;
    provider: Record<string, unknown>;
    tools: { function: { name: string } }[];
    messages: { role: string; content: string }[];
  };
}

const ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_BASE_URL",
  "OPENROUTER_DATA_COLLECTION",
  "OPENROUTER_PROVIDER_ONLY",
  "ASSISTANT_MODEL",
  "ASSISTANT_RATE_LIMIT_PER_10MIN",
  "ASSISTANT_DAILY_CAP",
];
let savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.OPENROUTER_API_KEY = "sk-or-test";
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/assistant/chat — garde-fous", () => {
  it("répond 503 sans clé API (le widget bascule sur le formulaire)", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const POST = await loadRoute();
    const res = await POST(request(validBody));
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuse un appel venu d'un autre site", async () => {
    const POST = await loadRoute();
    const res = await POST(request(validBody, { origin: "https://autre-site.example" }));
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepte l'origine du site", async () => {
    fetchMock.mockResolvedValue(textReply("Ok"));
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
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("limite le débit par adresse IP", async () => {
    process.env.ASSISTANT_RATE_LIMIT_PER_10MIN = "2";
    fetchMock.mockImplementation(async () => textReply("Ok"));
    const POST = await loadRoute();
    const same = { "x-forwarded-for": "10.77.0.1" };
    expect((await POST(request(validBody, same))).status).toBe(200);
    expect((await POST(request(validBody, same))).status).toBe(200);
    expect((await POST(request(validBody, same))).status).toBe(429);
  });

  it("applique un plafond quotidien global", async () => {
    process.env.ASSISTANT_DAILY_CAP = "1";
    fetchMock.mockImplementation(async () => textReply("Ok"));
    const POST = await loadRoute();
    expect((await POST(request(validBody))).status).toBe(200);
    expect((await POST(request(validBody))).status).toBe(429);
  });
});

describe("POST /api/assistant/chat — appel au modèle", () => {
  it("envoie une consigne système, des outils d'interface et un historique commençant par le visiteur", async () => {
    fetchMock.mockResolvedValue(
      sse(
        chunk({ content: "Merci. " }),
        chunk({ content: "Combien de médecins ?" }),
        chunk({ tool_calls: [{ index: 0, id: "c1", function: { name: "suggest_replies", arguments: '{"replies":["1 à 3",' } }] }),
        chunk({ tool_calls: [{ index: 0, function: { arguments: '"4 à 10"]}' } }] }),
        chunk({}, "tool_calls"),
      ),
    );
    const POST = await loadRoute();
    const res = await POST(request(validBody));

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/x-ndjson");
    expect(res.headers.get("x-accel-buffering")).toBe("no");

    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer sk-or-test");

    const body = sentBody();
    expect(body.model).toBe("deepseek/deepseek-v4-flash");
    expect(body.stream).toBe(true);
    expect(body.tool_choice).toBe("auto");
    expect(body.reasoning).toEqual({ enabled: false });
    expect(body.provider).toEqual({ require_parameters: true, data_collection: "deny" });
    expect(body.tools.map((t) => t.function.name)).toEqual(["suggest_replies", "show_contact_form", "show_demo_booking"]);

    // Une seule consigne système : prompt stable, puis contexte du visiteur (parcours, ouverture déjà affichée).
    expect(body.messages[0]!.role).toBe("system");
    expect(body.messages[0]!.content).toContain("# BASE DE CONNAISSANCES");
    expect(body.messages[0]!.content).toContain("# CONTEXTE DE CETTE CONVERSATION");
    expect(body.messages[0]!.content).toContain("Bonjour, vous dirigez une clinique ?");
    // L'ouverture statique (rôle assistant) est sortie de l'historique : le premier échange est celui du visiteur.
    expect(body.messages.slice(1)).toEqual([{ role: "user", content: "Oui, avec 4 médecins." }]);

    const out = await events(res);
    expect(out.filter((e) => e.t === "text").map((e) => e.d).join("")).toBe("Merci. Combien de médecins ?");
    expect(out.find((e) => e.t === "actions")?.actions).toEqual([{ type: "replies", replies: ["1 à 3", "4 à 10"] }]);
    expect(out[out.length - 1]).toEqual({ t: "done" });
  });

  it("garde le préfixe de la consigne identique d'un visiteur à l'autre (cache de prompt des hébergeurs)", async () => {
    fetchMock.mockImplementation(async () => textReply("Ok"));
    const POST = await loadRoute();
    await (await POST(request(validBody))).text();
    await (await POST(request({ ...validBody, topicId: "solutions/medicpro" }))).text();

    const systems = fetchMock.mock.calls.map((c) => JSON.parse((c[1] as RequestInit).body as string).messages[0].content as string);
    const stable = (s: string) => s.slice(0, s.indexOf("# CONTEXTE DE CETTE CONVERSATION"));
    expect(stable(systems[0]!)).toBe(stable(systems[1]!));
    expect(systems[0]).not.toBe(systems[1]);
  });

  it("applique le modèle, la confidentialité et les hébergeurs choisis par l'environnement", async () => {
    process.env.ASSISTANT_MODEL = "deepseek/deepseek-v3.2";
    process.env.OPENROUTER_DATA_COLLECTION = "allow";
    process.env.OPENROUTER_PROVIDER_ONLY = " deepinfra , parasail ,";
    process.env.OPENROUTER_BASE_URL = "http://localhost:4010/v1";
    fetchMock.mockResolvedValue(textReply("Ok"));
    const POST = await loadRoute();
    await (await POST(request(validBody))).text();

    expect(fetchMock.mock.calls[0]![0]).toBe("http://localhost:4010/v1/chat/completions");
    const body = sentBody();
    expect(body.model).toBe("deepseek/deepseek-v3.2");
    expect(body.provider).toEqual({
      require_parameters: true,
      data_collection: "allow",
      only: ["deepinfra", "parasail"],
    });
  });

  it("toute valeur autre que « allow » garde le filtre de confidentialité", async () => {
    process.env.OPENROUTER_DATA_COLLECTION = "n'importe quoi";
    fetchMock.mockResolvedValue(textReply("Ok"));
    const POST = await loadRoute();
    await (await POST(request(validBody))).text();
    expect(sentBody().provider.data_collection).toBe("deny");
  });

  it("applique l'état : pas de formulaire si les coordonnées sont déjà recueillies", async () => {
    fetchMock.mockResolvedValue(
      sse(
        chunk({ content: "Voici" }),
        chunk({ tool_calls: [{ index: 0, id: "c1", function: { name: "show_contact_form", arguments: '{"summary":"Résumé."}' } }] }),
        chunk({}, "tool_calls"),
      ),
    );
    const POST = await loadRoute();
    const res = await POST(request({ ...validBody, state: { ...state, contactFormShown: true, contactCaptured: true } }));
    const out = await events(res);
    expect(out.find((e) => e.t === "actions")?.actions).toEqual([{ type: "demo_booking" }]);
  });

  it("accepte une réponse réduite à un appel d'outil (sans texte)", async () => {
    fetchMock.mockResolvedValue(
      sse(
        chunk({ tool_calls: [{ index: 0, id: "c1", function: { name: "show_demo_booking", arguments: "" } }] }),
        chunk({}, "tool_calls"),
      ),
    );
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "actions", actions: [{ type: "demo_booking" }] }, { t: "done" }]);
  });

  it("signale un filtrage de contenu sans exposer de détail", async () => {
    fetchMock.mockResolvedValue(sse(chunk({}, "content_filter")));
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "refused" }]);
  });

  it("signale une panne du service et ne journalise aucune donnée du visiteur", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "No endpoints found matching your data policy" } }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "unavailable" }]);

    const logged = JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).toContain("404");
    expect(logged).not.toContain("médecins");
    expect(logged).not.toContain("sk-or-test");
  });

  it("signale une panne réseau", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "unavailable" }]);
  });

  it("traite une réponse vide comme une panne", async () => {
    fetchMock.mockResolvedValue(sse(chunk({}, "stop")));
    const POST = await loadRoute();
    const out = await events(await POST(request(validBody)));
    expect(out).toEqual([{ t: "error", code: "unavailable" }]);
  });
});
