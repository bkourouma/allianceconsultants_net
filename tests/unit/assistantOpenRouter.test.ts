import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterError, streamChatCompletion, type StreamParams } from "@/lib/assistant/openrouter";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

/** Réponse SSE dont les morceaux sont coupés où l'on veut (le réseau ne respecte pas les lignes). */
function sseResponse(parts: string[], init: ResponseInit = { status: 200 }) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream" }, ...init });
}

const data = (obj: unknown) => `data: ${JSON.stringify(obj)}\n\n`;
const delta = (d: Record<string, unknown>, finish: string | null = null) =>
  data({ model: "deepseek/deepseek-v4-flash", choices: [{ delta: d, finish_reason: finish }] });

function params(over: Partial<StreamParams> = {}): StreamParams {
  return {
    apiKey: "sk-or-test",
    model: "deepseek/deepseek-v4-flash",
    messages: [{ role: "user", content: "Bonjour" }],
    tools: [],
    maxTokens: 100,
    temperature: 0.4,
    provider: { dataCollection: "deny" },
    onText: () => {},
    ...over,
  };
}

describe("streamChatCompletion — requête", () => {
  it("appelle OpenRouter avec la clé, les outils et les options de confidentialité", async () => {
    fetchMock.mockResolvedValue(sseResponse([delta({ content: "Ok" }, "stop"), "data: [DONE]\n\n"]));
    await streamChatCompletion(params({ provider: { dataCollection: "deny", only: ["deepinfra"] }, referer: "https://allianceconsultants.net" }));

    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer sk-or-test");
    expect(init.headers["HTTP-Referer"]).toBe("https://allianceconsultants.net");

    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      model: "deepseek/deepseek-v4-flash",
      stream: true,
      tool_choice: "auto",
      max_tokens: 100,
      reasoning: { enabled: false },
      provider: { require_parameters: true, data_collection: "deny", only: ["deepinfra"] },
    });
  });

  it("n'envoie pas `only` quand aucun hébergeur n'est imposé, et accepte une URL de base alternative", async () => {
    fetchMock.mockResolvedValue(sseResponse([delta({ content: "Ok" }, "stop"), "data: [DONE]\n\n"]));
    await streamChatCompletion(params({ baseUrl: "http://localhost:4010/v1" }));
    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe("http://localhost:4010/v1/chat/completions");
    expect(JSON.parse(init.body as string).provider).toEqual({ require_parameters: true, data_collection: "deny" });
  });
});

describe("streamChatCompletion — lecture du flux", () => {
  it("assemble le texte et le diffuse fragment par fragment, même si les lignes sont coupées en deux", async () => {
    const full = delta({ content: "Bonjour " }) + delta({ content: "à tous" }) + delta({}, "stop") + "data: [DONE]\n\n";
    // Découpage arbitraire, y compris au milieu d'un « data: {…} ».
    const parts = [full.slice(0, 17), full.slice(17, 90), full.slice(90, 140), full.slice(140)];
    fetchMock.mockResolvedValue(sseResponse(parts));

    const seen: string[] = [];
    const out = await streamChatCompletion(params({ onText: (d) => seen.push(d) }));
    expect(seen).toEqual(["Bonjour ", "à tous"]);
    expect(out.text).toBe("Bonjour à tous");
    expect(out.finishReason).toBe("stop");
    expect(out.model).toBe("deepseek/deepseek-v4-flash");
  });

  it("ignore les messages de maintien de connexion et les lignes illisibles", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        ": OPENROUTER PROCESSING\n\n",
        "data: {pas du json\n\n",
        delta({ content: "Ok" }),
        ": OPENROUTER PROCESSING\n\n",
        delta({}, "stop"),
        "data: [DONE]\n\n",
      ]),
    );
    const out = await streamChatCompletion(params());
    expect(out.text).toBe("Ok");
  });

  it("reconstitue un appel d'outil dont les arguments arrivent en plusieurs morceaux", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        delta({ content: "Je vous propose les choix suivants." }),
        delta({ tool_calls: [{ index: 0, id: "call_1", function: { name: "suggest_replies", arguments: "" } }] }),
        delta({ tool_calls: [{ index: 0, function: { arguments: '{"replies":["1 ' } }] }),
        delta({ tool_calls: [{ index: 0, function: { arguments: 'à 3","4 à 10"]}' } }] }),
        delta({}, "tool_calls"),
        "data: [DONE]\n\n",
      ]),
    );
    const out = await streamChatCompletion(params());
    expect(out.finishReason).toBe("tool_calls");
    expect(out.toolCalls).toEqual([{ name: "suggest_replies", arguments: '{"replies":["1 à 3","4 à 10"]}' }]);
    expect(JSON.parse(out.toolCalls[0]!.arguments)).toEqual({ replies: ["1 à 3", "4 à 10"] });
  });

  it("garde l'ordre de plusieurs appels d'outils", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        delta({
          tool_calls: [
            { index: 1, id: "b", function: { name: "show_demo_booking", arguments: "{}" } },
            { index: 0, id: "a", function: { name: "suggest_replies", arguments: '{"replies":["a","b"]}' } },
          ],
        }),
        delta({}, "tool_calls"),
        "data: [DONE]\n\n",
      ]),
    );
    const out = await streamChatCompletion(params());
    expect(out.toolCalls.map((c) => c.name)).toEqual(["suggest_replies", "show_demo_booking"]);
  });

  it("lit la consommation de tokens, y compris les tokens en cache", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        delta({ content: "Ok" }, "stop"),
        data({ choices: [], usage: { prompt_tokens: 9500, completion_tokens: 42, prompt_tokens_details: { cached_tokens: 9000 } } }),
        "data: [DONE]\n\n",
      ]),
    );
    const out = await streamChatCompletion(params());
    expect(out.usage).toEqual({ promptTokens: 9500, completionTokens: 42, cachedTokens: 9000 });
  });

  it("ignore le raisonnement interne : seul le contenu est affiché", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([
        delta({ reasoning: "Je réfléchis à la question…" }),
        delta({ content: "Réponse." }, "stop"),
        "data: [DONE]\n\n",
      ]),
    );
    const seen: string[] = [];
    const out = await streamChatCompletion(params({ onText: (d) => seen.push(d) }));
    expect(seen).toEqual(["Réponse."]);
    expect(out.text).toBe("Réponse.");
  });
});

describe("streamChatCompletion — erreurs", () => {
  it("lève OpenRouterError avec le statut HTTP et le message du service", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "No endpoints found matching your data policy" } }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );
    await expect(streamChatCompletion(params())).rejects.toMatchObject({
      name: "OpenRouterError",
      status: 404,
      message: "No endpoints found matching your data policy",
    });
  });

  it("lève une erreur quand le fournisseur échoue en plein flux", async () => {
    fetchMock.mockResolvedValue(
      sseResponse([delta({ content: "Début" }), data({ error: { code: 502, message: "Provider disconnected" } })]),
    );
    const failure = streamChatCompletion(params());
    await expect(failure).rejects.toBeInstanceOf(OpenRouterError);
    await expect(failure).rejects.toMatchObject({ status: 502 });
  });

  it("transmet le signal d'annulation à fetch", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue(sseResponse([delta({ content: "Ok" }, "stop"), "data: [DONE]\n\n"]));
    await streamChatCompletion(params({ signal: controller.signal }));
    expect((fetchMock.mock.calls[0]![1] as RequestInit).signal).toBe(controller.signal);
  });
});
