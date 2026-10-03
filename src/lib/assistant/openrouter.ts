/**
 * Client minimal pour l'API OpenRouter (format « chat completions » compatible OpenAI), en streaming.
 * Un simple `fetch` suffit : pas de SDK à embarquer pour un seul appel.
 */

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterTool {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ToolCall {
  name: string;
  /** Arguments JSON bruts, tels que diffusés par le modèle (à valider avant usage). */
  arguments: string;
}

export interface Completion {
  text: string;
  toolCalls: ToolCall[];
  /** `stop`, `tool_calls`, `length`, `content_filter`, `error`… ou null si le flux s'est terminé sans motif. */
  finishReason: string | null;
  model: string | null;
  usage: { promptTokens: number; completionTokens: number; cachedTokens: number } | null;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export interface StreamParams {
  apiKey: string;
  model: string;
  messages: ChatTurn[];
  tools: OpenRouterTool[];
  maxTokens: number;
  temperature: number;
  /** Routage OpenRouter : confidentialité et restriction éventuelle des hébergeurs. */
  provider: { dataCollection: "allow" | "deny"; only?: string[] };
  signal?: AbortSignal;
  /** Appelé à chaque fragment de texte, au fil du flux. */
  onText: (delta: string) => void;
  baseUrl?: string;
  /** Origine du site, transmise à OpenRouter pour l'attribution (facultatif). */
  referer?: string;
}

interface StreamChunk {
  model?: string;
  error?: { message?: string; code?: number | string };
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  choices?: {
    finish_reason?: string | null;
    delta?: {
      content?: string | null;
      tool_calls?: {
        index?: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }[];
    };
  }[];
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

/**
 * Appelle le modèle en streaming et renvoie la réponse complète une fois le flux terminé.
 * Lève `OpenRouterError` en cas de refus HTTP ou d'erreur annoncée dans le flux.
 */
export async function streamChatCompletion(params: StreamParams): Promise<Completion> {
  const body = {
    model: params.model,
    messages: params.messages,
    tools: params.tools,
    tool_choice: "auto",
    stream: true,
    max_tokens: params.maxTokens,
    temperature: params.temperature,
    // Pas de phase de réflexion : la latence d'une conversation compte plus que la profondeur.
    reasoning: { enabled: false },
    provider: {
      // N'accepter que des hébergeurs qui gèrent tous les paramètres (outils compris).
      require_parameters: true,
      data_collection: params.provider.dataCollection,
      ...(params.provider.only?.length ? { only: params.provider.only } : {}),
    },
  };

  const res = await fetch(`${params.baseUrl ?? DEFAULT_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Alliance Consultants",
      ...(params.referer ? { "HTTP-Referer": params.referer } : {}),
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  if (!res.ok || !res.body) {
    throw new OpenRouterError(await readErrorMessage(res), res.status);
  }

  const completion: Completion = { text: "", toolCalls: [], finishReason: null, model: null, usage: null };
  const calls = new Map<number, ToolCall & { id?: string }>();

  const handle = (chunk: StreamChunk) => {
    if (chunk.error) {
      throw new OpenRouterError(chunk.error.message ?? "stream error", Number(chunk.error.code) || 502);
    }
    if (chunk.model) completion.model = chunk.model;
    if (chunk.usage) {
      completion.usage = {
        promptTokens: chunk.usage.prompt_tokens ?? 0,
        completionTokens: chunk.usage.completion_tokens ?? 0,
        cachedTokens: chunk.usage.prompt_tokens_details?.cached_tokens ?? 0,
      };
    }
    const choice = chunk.choices?.[0];
    if (!choice) return;
    if (choice.finish_reason) completion.finishReason = choice.finish_reason;

    const delta = choice.delta;
    if (typeof delta?.content === "string" && delta.content) {
      completion.text += delta.content;
      params.onText(delta.content);
    }
    for (const piece of delta?.tool_calls ?? []) {
      // Les fragments d'un même appel partagent le même `index` ; le nom arrive une fois, les arguments par morceaux.
      const index = piece.index ?? 0;
      const call = calls.get(index) ?? { name: "", arguments: "" };
      if (piece.id) call.id = piece.id;
      if (piece.function?.name) call.name += piece.function.name;
      if (piece.function?.arguments) call.arguments += piece.function.arguments;
      calls.set(index, call);
    }
  };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  while (!finished) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      // Les lignes « : … » sont des messages de maintien de connexion d'OpenRouter.
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        finished = true;
        break;
      }
      let chunk: StreamChunk;
      try {
        chunk = JSON.parse(payload) as StreamChunk;
      } catch {
        continue;
      }
      handle(chunk);
    }
  }

  completion.toolCalls = [...calls.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, call]) => ({ name: call.name, arguments: call.arguments }))
    .filter((call) => call.name);
  return completion;
}
