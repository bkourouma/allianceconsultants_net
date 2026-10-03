import { z } from "zod";

/**
 * Contrat partagé entre le widget (client) et POST /api/assistant/chat (serveur).
 * Ne dépend que de zod : importable des deux côtés.
 */

export const MAX_USER_MESSAGES = 24;
export const MAX_MESSAGE_CHARS = 1000;

/** "solutions/cliniquepro", "home", "blog/mon-article"… (jamais de slash initial). */
export const TopicIdSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9][a-z0-9/_-]*$/);

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2400),
});

/** État de l'interface, calculé côté client et rappelé au modèle à chaque tour. */
export const ChatStateSchema = z.object({
  contactFormShown: z.boolean(),
  contactCaptured: z.boolean(),
  contactFirstName: z.string().max(60).optional(),
  bookingShown: z.boolean(),
  bookingDone: z.boolean(),
});

export const JourneyEntrySchema = z.object({
  id: TopicIdSchema,
  seconds: z.number().int().min(0).max(7200),
  /** Profondeur de lecture maximale, 0..1. */
  scroll: z.number().min(0).max(1),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(MAX_USER_MESSAGES * 2 + 2),
  /** Page d'où la conversation est partie (détermine le sujet d'ouverture). */
  topicId: TopicIdSchema,
  /** Pages vues, de la plus ancienne à la plus récente. */
  journey: z.array(JourneyEntrySchema).max(8),
  state: ChatStateSchema,
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatState = z.infer<typeof ChatStateSchema>;
export type JourneyEntry = z.infer<typeof JourneyEntrySchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/** Actions d'interface déclenchées par le modèle via ses outils. */
export type AssistantAction =
  | { type: "replies"; replies: string[] }
  | { type: "contact_form"; summary: string }
  | { type: "demo_booking" };

/** Événements envoyés au client, un objet JSON par ligne (NDJSON). */
export type ChatStreamEvent =
  | { t: "text"; d: string }
  | { t: "actions"; actions: AssistantAction[] }
  | { t: "done" }
  | { t: "error"; code: "unavailable" | "refused" };

// ---------------------------------------------------------------------------
// Identification des pages
// ---------------------------------------------------------------------------

/** Pages sur lesquelles l'assistant ne lance jamais d'accroche proactive. */
const QUIET_SEGMENTS = new Set([
  "contact-demo",
  "contact-recu",
  "contact-erreur",
  "privacy",
  "mentions-legales",
]);

/** "/solutions/cliniquepro/?x=1" → "solutions/cliniquepro"  ·  "/" → "home". */
export function pathToTopicId(pathname: string): string {
  const clean = pathname
    .split(/[?#]/)[0]!
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
  if (!clean) return "home";
  const id = clean.split("/").slice(0, 2).join("/");
  return TopicIdSchema.safeParse(id).success ? id : "home";
}

export function isQuietPage(topicId: string): boolean {
  return QUIET_SEGMENTS.has(topicId.split("/")[0]!);
}
