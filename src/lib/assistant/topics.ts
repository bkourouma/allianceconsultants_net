import type { AssistantConfig, AssistantTopic } from "@/lib/validators/content";

/**
 * Retrouve le sujet éditorial d'une page : identifiant exact
 * ("solutions/cliniquepro"), sinon la rubrique ("solutions"), sinon "default".
 */
export function resolveTopic(
  config: Pick<AssistantConfig, "topics">,
  id: string,
): AssistantTopic {
  const byId = new Map(config.topics.map((t) => [t.id, t]));
  return (
    byId.get(id) ??
    byId.get(id.split("/")[0]!) ??
    // Le schéma garantit la présence du sujet "default".
    byId.get("default")!
  );
}

/** Ce que le navigateur a le droit de voir : jamais l'axe de découverte (`focus`). */
export interface PublicTopic {
  id: string;
  kind: AssistantTopic["kind"];
  label: string;
  line?: AssistantTopic["line"];
  nudge: string;
  opener: string;
  replies: string[];
}

export function toPublicTopic(topic: AssistantTopic): PublicTopic {
  const { id, kind, label, line, nudge, opener, replies } = topic;
  return { id, kind, label, line, nudge, opener, replies };
}

/** Réponse de GET /api/assistant/topic. */
export interface TopicResponse {
  assistantName: string;
  /** URL Calendly de réservation, ou null (repli : rappel par un consultant). */
  calendlyUrl: string | null;
  contact: { phone: string | null; whatsapp: string | null };
  topic: PublicTopic;
}
