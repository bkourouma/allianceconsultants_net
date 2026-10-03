import Anthropic from "@anthropic-ai/sdk";
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
import { buildContextBlock, buildStablePrompt } from "@/lib/assistant/prompt";
import { actionsFromContent, ASSISTANT_TOOLS } from "@/lib/assistant/tools";
import { resolveTopic } from "@/lib/assistant/topics";
import { consumeRateLimit, getClientIpFromHeaders } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "claude-opus-5-5";
const MAX_OUTPUT_TOKENS = 2048;
const MAX_BODY_BYTES = 64 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey, maxRetries: 1, timeout: 45_000 });
  return client;
}

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
 * Prépare l'historique pour l'API : le premier message doit venir de l'utilisateur. Le message
 * d'ouverture statique (rôle assistant) est donc retiré et rappelé dans le contexte ; les
 * messages consécutifs d'un même rôle sont fusionnés.
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

function modelOptions(model: string): Pick<Anthropic.MessageCreateParams, "output_config"> {
  // La famille 5 accepte `effort` ; un échange de conversation n'a pas besoin de longue réflexion.
  return /^claude-(opus|sonnet|fable)-5/.test(model)
    ? { output_config: { effort: "low" } }
    : {};
}

export async function POST(req: NextRequest) {
  if (isCrossOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const anthropic = getClient();
  if (!anthropic) {
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

  const model = process.env.ASSISTANT_MODEL || DEFAULT_MODEL;
  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      const stream = anthropic.messages.stream({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        ...modelOptions(model),
        system: [
          {
            type: "text",
            text: buildStablePrompt(config.name, knowledgeBase),
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: buildContextBlock({
              request,
              topic,
              journey,
              opener,
              userMessageCount: userMessages.length,
            }),
          },
        ],
        tools: ASSISTANT_TOOLS,
        tool_choice: { type: "auto" },
        messages,
      });

      const onAbort = () => stream.abort();
      req.signal.addEventListener("abort", onAbort);

      let streamedText = false;
      stream.on("text", (delta) => {
        streamedText = true;
        send({ t: "text", d: delta });
      });

      try {
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          send({ t: "error", code: "refused" });
        } else {
          const actions = actionsFromContent(final.content, request.state);
          if (actions.length > 0) send({ t: "actions", actions });
          if (!streamedText && actions.length === 0) {
            send({ t: "error", code: "unavailable" });
          } else {
            send({ t: "done" });
          }
        }
        console.info(
          `[assistant] model=${final.model} in=${final.usage.input_tokens} out=${final.usage.output_tokens} cache_read=${final.usage.cache_read_input_tokens ?? 0} stop=${final.stop_reason}`,
        );
      } catch (error) {
        if (!req.signal.aborted) {
          const status = error instanceof Anthropic.APIError ? error.status : "n/a";
          console.error(`[assistant] model call failed (status ${status})`);
          send({ t: "error", code: "unavailable" });
        }
      } finally {
        req.signal.removeEventListener("abort", onAbort);
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
