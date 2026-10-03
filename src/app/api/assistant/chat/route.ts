import { NextResponse, type NextRequest } from "next/server";
import { getAssistantConfig } from "@/lib/content";
import {
  ChatRequestSchema,
  MAX_MESSAGE_CHARS,
  MAX_USER_MESSAGES,
  type ChatMessage,
  type ChatRequest,
  type ChatStreamEvent,
} from "@/lib/assistant/protocol";
import { getKnowledgeBase } from "@/lib/assistant/knowledge";
import { OpenRouterError, streamChatCompletion } from "@/lib/assistant/openrouter";
import { buildContextBlock, buildStablePrompt } from "@/lib/assistant/prompt";
import { actionsFromToolCalls, ASSISTANT_TOOLS } from "@/lib/assistant/tools";
import { resolveTopic } from "@/lib/assistant/topics";
import { consumeRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DeepSeek V4 Flash : tous ses hébergeurs OpenRouter gèrent les outils ; contexte 1 M ; tarif minimal. */
const DEFAULT_MODEL = "deepseek/deepseek-v4-flash";
const MAX_OUTPUT_TOKENS = 800;
const TEMPERATURE = 0.4;
const MAX_BODY_BYTES = 64 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;

function envInt(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Refuse les appels venus d'un autre site (le widget appelle toujours depuis la même origine). */
function isCrossOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
}

/**
 * Prépare l'historique : le message d'ouverture statique (rôle assistant, placé en tête) est retiré
 * et rappelé dans le contexte ; les messages consécutifs d'un même rôle sont fusionnés.
 */
function normalizeMessages(messages: ChatMessage[]): {
  opener: string | null;
  messages: ChatMessage[];
} {
  let opener: string | null = null;
  const rest = [...messages];
  while (rest[0]?.role === "assistant") {
    opener ??= rest[0].content;
    rest.shift();
  }
  const merged: ChatMessage[] = [];
  for (const m of rest) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content}\n\n${m.content}`;
    } else {
      merged.push({ ...m });
    }
  }
  return { opener, messages: merged };
}

export async function POST(req: NextRequest) {
  if (isCrossOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const ip = getClientIpFromHeaders(req.headers);
  const perIp = consumeRateLimit({
    bucket: "assistant-chat",
    identifier: ip,
    max: envInt("ASSISTANT_RATE_LIMIT_PER_10MIN", 40),
  });
  const perDay = consumeRateLimit({
    bucket: "assistant-chat-day",
    identifier: "all",
    max: envInt("ASSISTANT_DAILY_CAP", 3000),
    windowMs: DAY_MS,
  });
  if (!perIp.allowed || !perDay.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) throw new Error("too_large");
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const request: ChatRequest = parsed.data;

  const { opener, messages } = normalizeMessages(request.messages);
  const userMessages = messages.filter((m) => m.role === "user");
  const last = messages[messages.length - 1];
  if (
    !last ||
    last.role !== "user" ||
    userMessages.length > MAX_USER_MESSAGES ||
    userMessages.some((m) => m.content.length > MAX_MESSAGE_CHARS)
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const [config, knowledgeBase] = await Promise.all([getAssistantConfig(), getKnowledgeBase()]);
  const topic = resolveTopic(config, request.topicId);

  const journey = request.journey.flatMap((entry) => {
    const resolved = resolveTopic(config, entry.id);
    // Les pages sans sujet propre (contact, mentions légales…) n'apprennent rien au modèle.
    if (resolved.id === "default") return [];
    return [{ ...entry, label: resolved.label }];
  });

  // Une seule consigne système : la partie stable d'abord (préfixe identique d'un visiteur à l'autre,
  // utile aux hébergeurs qui mettent le début du prompt en cache), le contexte du visiteur ensuite.
  const system = [
    buildStablePrompt(config.name, knowledgeBase),
    buildContextBlock({ request, topic, journey, opener, userMessageCount: userMessages.length }),
  ].join("\n\n");

  const model = process.env.ASSISTANT_MODEL || DEFAULT_MODEL;
  const only = (process.env.OPENROUTER_PROVIDER_ONLY ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // Flux déjà fermé par l'annulation du client.
        }
      };

      try {
        const completion = await streamChatCompletion({
          apiKey,
          baseUrl: process.env.OPENROUTER_BASE_URL || undefined,
          referer: process.env.NEXT_PUBLIC_SITE_URL,
          model,
          messages: [{ role: "system", content: system }, ...messages],
          tools: ASSISTANT_TOOLS,
          maxTokens: MAX_OUTPUT_TOKENS,
          temperature: TEMPERATURE,
          provider: {
            dataCollection: process.env.OPENROUTER_DATA_COLLECTION === "allow" ? "allow" : "deny",
            only,
          },
          signal: req.signal,
          onText: (delta) => send({ t: "text", d: delta }),
        });

        const actions = actionsFromToolCalls(completion.toolCalls, request.state);
        if (completion.finishReason === "content_filter") {
          send({ t: "error", code: "refused" });
        } else if (completion.finishReason === "error" || (!completion.text.trim() && actions.length === 0)) {
          send({ t: "error", code: "unavailable" });
        } else {
          if (actions.length > 0) send({ t: "actions", actions });
          send({ t: "done" });
        }
        // Statistiques seulement : jamais de contenu de conversation dans les journaux.
        console.info(
          `[assistant] model=${completion.model ?? model} prompt=${completion.usage?.promptTokens ?? "?"} completion=${completion.usage?.completionTokens ?? "?"} cached=${completion.usage?.cachedTokens ?? 0} finish=${completion.finishReason}`,
        );
      } catch (error) {
        if (!req.signal.aborted) {
          const status = error instanceof OpenRouterError ? error.status : "n/a";
          console.error(`[assistant] model call failed (status ${status})`);
          send({ t: "error", code: "unavailable" });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Flux déjà fermé par l'annulation du client.
        }
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      // Empêche nginx de mettre la réponse en mémoire tampon : le texte doit arriver au fil de l'eau.
      "X-Accel-Buffering": "no",
    },
  });
}
