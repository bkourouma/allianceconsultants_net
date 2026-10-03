"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_MESSAGE_CHARS,
  MAX_USER_MESSAGES,
  type AssistantAction,
  type ChatRequest,
  type ChatState,
  type ChatStreamEvent,
  type JourneyEntry,
} from "@/lib/assistant/protocol";
import type { TopicResponse } from "@/lib/assistant/topics";
import { track } from "./analytics";
import { getJourneySnapshot } from "./journey";

export type ThreadItem =
  | {
      id: string;
      kind: "message";
      role: "user" | "assistant";
      text: string;
      streaming?: boolean;
      /** Réponses rapides, affichées seulement sous le dernier message de l'assistant. */
      replies?: string[];
      /** Message d'interface (erreur, information) : affiché mais jamais envoyé au modèle. */
      local?: boolean;
    }
  | { id: string; kind: "contact_form"; summary: string; status: "open" | "submitted" | "dismissed" }
  | { id: string; kind: "booking"; status: "prompt" | "done" };

export interface ContactValues {
  name: string;
  organization: string;
  email: string;
  phone: string;
  consent: true;
  honeypot: string;
}

export type SubmitResult = { ok: true } | { ok: false; message: string };

const STORAGE_KEY = "acc-assistant-chat";
const MAX_API_MESSAGES = MAX_USER_MESSAGES * 2 + 2;

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function deriveState(items: ThreadItem[], firstName: string | undefined): ChatState {
  const forms = items.filter((i) => i.kind === "contact_form");
  const bookings = items.filter((i) => i.kind === "booking");
  return {
    contactFormShown: forms.length > 0,
    contactCaptured: forms.some((f) => f.status === "submitted"),
    contactFirstName: firstName,
    bookingShown: bookings.length > 0,
    bookingDone: bookings.some((b) => b.status === "done"),
  };
}

function stripReplies(item: ThreadItem): ThreadItem {
  return item.kind === "message" && item.replies ? { ...item, replies: undefined } : item;
}

/** Historique envoyé au modèle : uniquement les vrais messages, jamais les éléments d'interface. */
function toApiMessages(items: ThreadItem[]): ChatRequest["messages"] {
  const messages = items.flatMap((item) =>
    item.kind === "message" && !item.local && item.text.trim()
      ? [{ role: item.role, content: item.text.slice(0, 2400) }]
      : [],
  );
  return messages.slice(-MAX_API_MESSAGES);
}

/** Intention du lead selon la page d'où la conversation est partie. */
function intentFromTopicId(topicId: string): "demo" | "training" | "automation" {
  if (topicId.startsWith("formations")) return "training";
  if (topicId === "services/automatisation-ia-processus-metiers") return "automation";
  return "demo";
}

function solutionSlugFromTopicId(topicId: string): string | undefined {
  const [section, slug] = topicId.split("/");
  return section === "solutions" ? slug : undefined;
}

function leadMessage(summary: string, journey: JourneyEntry[]): string {
  const pages = journey.map((j) => `${j.id} (${j.seconds} s)`).join(" → ");
  const parts = [
    "Demande reçue via l'assistant IA du site.",
    "",
    "Résumé de l'échange :",
    summary.trim(),
  ];
  if (pages) parts.push("", `Pages consultées : ${pages}`);
  return parts.join("\n").slice(0, 4000);
}

const NOTICES = {
  unavailable:
    "Je rencontre un souci technique et ne peux pas vous répondre pour le moment. Laissez-moi vos coordonnées : un consultant vous répondra rapidement.",
  rate_limited:
    "Vous avez beaucoup écrit en peu de temps et je dois faire une pause. Laissez vos coordonnées : un consultant prendra le relais.",
  refused:
    "Je ne peux pas répondre à cette question. Un consultant pourra vous aider : laissez vos coordonnées et il reviendra vers vous.",
  limit:
    "Notre échange est déjà long. Pour aller plus loin, le plus simple est d'en parler avec un consultant : laissez vos coordonnées ou réservez un créneau.",
} as const;

type FailureCode = keyof typeof NOTICES;

interface Persisted {
  topicId: string;
  items: ThreadItem[];
  firstName?: string;
}

function loadPersisted(topicId: string): Persisted | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    // Un échange interrompu ne reprend pas : on retire les messages encore « en cours ».
    const items = parsed.items
      .map((i) => (i.kind === "message" && i.streaming ? { ...i, streaming: false } : i))
      .filter((i) => !(i.kind === "message" && i.role === "assistant" && !i.text));
    return { topicId: parsed.topicId ?? topicId, items, firstName: parsed.firstName };
  } catch {
    return null;
  }
}

/**
 * État de la conversation : fil de messages, streaming depuis /api/assistant/chat, formulaire de
 * coordonnées et réservation. Persisté en sessionStorage (effacé à la fermeture de l'onglet).
 */
export function useAssistantChat(config: TopicResponse) {
  const { topic } = config;
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [streaming, setStreaming] = useState(false);
  const itemsRef = useRef<ThreadItem[]>([]);
  const topicIdRef = useRef(topic.id);
  const firstNameRef = useRef<string | undefined>(undefined);
  /** Gardé en mémoire seulement (jamais persisté) pour pré-remplir la réservation. */
  const leadRef = useRef<{ name: string; email: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);

  const commit = useCallback((next: ThreadItem[]) => {
    itemsRef.current = next;
    setItems(next);
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          topicId: topicIdRef.current,
          items: next,
          firstName: firstNameRef.current,
        } satisfies Persisted),
      );
    } catch {
      // Stockage indisponible : la conversation reste en mémoire.
    }
  }, []);

  // Restaure la conversation de la session, sinon ouvre sur le message de la page courante.
  useEffect(() => {
    const restored = loadPersisted(topic.id);
    if (restored) {
      topicIdRef.current = restored.topicId;
      firstNameRef.current = restored.firstName;
      commit(restored.items);
      return;
    }
    topicIdRef.current = topic.id;
    commit([
      {
        id: uid(),
        kind: "message",
        role: "assistant",
        text: topic.opener,
        replies: topic.replies,
      },
    ]);
    // Une seule initialisation : le sujet d'ouverture ne change pas en cours de conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const state = useMemo(() => deriveState(items, firstNameRef.current), [items]);
  const userCount = useMemo(
    () => items.filter((i) => i.kind === "message" && i.role === "user").length,
    [items],
  );
  const limitReached = userCount >= MAX_USER_MESSAGES;

  /** Ajoute un message assistant d'interface suivi, si utile, du formulaire de coordonnées. */
  const fail = useCallback(
    (code: FailureCode, assistantId: string) => {
      let next = itemsRef.current.map((i) =>
        i.kind === "message" && i.id === assistantId ? { ...i, streaming: false } : i,
      );
      const target = next.find((i) => i.kind === "message" && i.id === assistantId);
      if (target && target.kind === "message" && target.text.trim()) {
        next = [
          ...next,
          { id: uid(), kind: "message", role: "assistant", text: NOTICES[code], local: true },
        ];
      } else {
        next = next.map((i) =>
          i.kind === "message" && i.id === assistantId
            ? { ...i, text: NOTICES[code], local: true }
            : i,
        );
      }
      const current = deriveState(next, firstNameRef.current);
      if (!current.contactFormShown && !current.contactCaptured) {
        const visitorWords = next
          .filter((i) => i.kind === "message" && i.role === "user")
          .map((i) => (i.kind === "message" ? i.text : ""))
          .join(" / ")
          .slice(0, 600);
        next = [
          ...next,
          {
            id: uid(),
            kind: "contact_form",
            summary: `Assistant indisponible lors de l'échange. Propos du visiteur : ${visitorWords}`,
            status: "open",
          },
        ];
        track("assistant_contact_form_shown", { source: "fallback" });
      }
      commit(next);
    },
    [commit],
  );

  const applyActions = useCallback(
    (actions: AssistantAction[], assistantId: string) => {
      let next = itemsRef.current;
      for (const action of actions) {
        if (action.type === "replies") {
          next = next.map((i) =>
            i.kind === "message" && i.id === assistantId ? { ...i, replies: action.replies } : i,
          );
        } else if (action.type === "contact_form") {
          next = [
            ...next,
            { id: uid(), kind: "contact_form", summary: action.summary, status: "open" },
          ];
          track("assistant_contact_form_shown", { source: "model" });
        } else if (action.type === "demo_booking") {
          if (!next.some((i) => i.kind === "booking")) {
            next = [...next, { id: uid(), kind: "booking", status: "prompt" }];
            track("assistant_booking_offered", { source: "model" });
          }
        }
      }
      commit(next);
    },
    [commit],
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!text || streamingRef.current) return;

      const assistantId = uid();
      const withUser: ThreadItem[] = [
        ...itemsRef.current.map(stripReplies),
        { id: uid(), kind: "message", role: "user", text },
      ];
      const sent = withUser.filter((i) => i.kind === "message" && i.role === "user").length;
      track("assistant_message_sent", { n: sent });

      if (sent > MAX_USER_MESSAGES) return;
      commit([
        ...withUser,
        { id: assistantId, kind: "message", role: "assistant", text: "", streaming: true },
      ]);
      streamingRef.current = true;
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const payload: ChatRequest = {
        messages: toApiMessages(withUser),
        topicId: topicIdRef.current,
        journey: getJourneySnapshot(),
        state: deriveState(withUser, firstNameRef.current),
      };

      // Objet plutôt que variable : l'échec est renseigné depuis une closure (lecture du flux).
      const outcome: { failure: FailureCode | null } = { failure: null };
      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          outcome.failure = res.status === 429 ? "rate_limited" : "unavailable";
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          const handle = (event: ChatStreamEvent) => {
            if (event.t === "text") {
              commit(
                itemsRef.current.map((i) =>
                  i.kind === "message" && i.id === assistantId
                    ? { ...i, text: i.text + event.d }
                    : i,
                ),
              );
            } else if (event.t === "actions") {
              applyActions(event.actions, assistantId);
            } else if (event.t === "error") {
              outcome.failure = event.code === "refused" ? "refused" : "unavailable";
            }
          };
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let newline: number;
            while ((newline = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, newline).trim();
              buffer = buffer.slice(newline + 1);
              if (!line) continue;
              try {
                handle(JSON.parse(line) as ChatStreamEvent);
              } catch {
                // Ligne illisible : ignorée, le reste du flux continue.
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          streamingRef.current = false;
          setStreaming(false);
          return;
        }
        outcome.failure = "unavailable";
      }

      streamingRef.current = false;
      setStreaming(false);

      if (outcome.failure) {
        fail(outcome.failure, assistantId);
        return;
      }
      commit(
        itemsRef.current
          .map((i) => (i.kind === "message" && i.id === assistantId ? { ...i, streaming: false } : i))
          .filter((i) => !(i.kind === "message" && i.id === assistantId && !i.text.trim())),
      );
    },
    [applyActions, commit, fail],
  );

  // Au-delà de la limite d'échanges, on bascule vers un humain (une seule fois).
  useEffect(() => {
    if (!limitReached || streaming) return;
    const already = itemsRef.current.some(
      (i) => i.kind === "message" && i.local && i.text === NOTICES.limit,
    );
    if (already) return;
    let next: ThreadItem[] = [
      ...itemsRef.current.map(stripReplies),
      { id: uid(), kind: "message", role: "assistant", text: NOTICES.limit, local: true },
    ];
    const current = deriveState(next, firstNameRef.current);
    if (!current.contactFormShown && !current.contactCaptured) {
      next = [
        ...next,
        { id: uid(), kind: "contact_form", summary: "Longue conversation avec l'assistant.", status: "open" },
      ];
    } else if (!current.bookingShown) {
      next = [...next, { id: uid(), kind: "booking", status: "prompt" }];
    }
    commit(next);
  }, [limitReached, streaming, commit]);

  const submitContact = useCallback(
    async (formId: string, values: ContactValues): Promise<SubmitResult> => {
      const form = itemsRef.current.find((i) => i.kind === "contact_form" && i.id === formId);
      if (!form || form.kind !== "contact_form") return { ok: false, message: "Formulaire introuvable." };

      const anchoredTopic = topicIdRef.current;
      let res: Response;
      try {
        res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: intentFromTopicId(anchoredTopic),
            solutionSlug: solutionSlugFromTopicId(anchoredTopic),
            fromPage: window.location.pathname,
            fromBlock: "assistant-ia",
            name: values.name,
            email: values.email,
            phone: values.phone,
            organization: values.organization,
            message: leadMessage(form.summary, getJourneySnapshot()),
            consent: true,
            honeypot: values.honeypot,
          }),
        });
      } catch {
        return { ok: false, message: "Connexion impossible. Vérifiez votre réseau et réessayez." };
      }
      if (res.status === 429) {
        return { ok: false, message: "Trop de tentatives. Réessayez dans quelques minutes." };
      }
      if (!res.ok) {
        return {
          ok: false,
          message:
            res.status === 400
              ? "Certaines informations semblent invalides. Vérifiez votre e-mail et votre téléphone."
              : "Une erreur est survenue. Réessayez, ou contactez-nous directement par téléphone.",
        };
      }

      const firstName = values.name.trim().split(/\s+/)[0] ?? values.name;
      firstNameRef.current = firstName;
      leadRef.current = { name: values.name.trim(), email: values.email.trim() };
      track("assistant_lead_submitted", { topic: anchoredTopic });

      const thanks = config.calendlyUrl
        ? `Merci ${firstName}, vos coordonnées sont bien transmises. Dernière étape : choisissez le créneau qui vous convient pour votre démonstration.`
        : `Merci ${firstName}, vos coordonnées sont bien transmises. Un consultant vous contactera sous 24 à 48 heures ouvrées pour organiser votre démonstration.`;
      let next: ThreadItem[] = itemsRef.current.map((i) =>
        i.kind === "contact_form" && i.id === formId ? { ...i, status: "submitted" as const } : i,
      );
      next = [
        ...next.map(stripReplies),
        { id: uid(), kind: "message", role: "assistant", text: thanks },
      ];
      if (!next.some((i) => i.kind === "booking")) {
        next = [...next, { id: uid(), kind: "booking", status: "prompt" }];
        track("assistant_booking_offered", { source: "after_form" });
      }
      commit(next);
      return { ok: true };
    },
    [commit, config.calendlyUrl],
  );

  const dismissContact = useCallback(
    (formId: string) => {
      commit(
        itemsRef.current.map((i) =>
          i.kind === "contact_form" && i.id === formId ? { ...i, status: "dismissed" as const } : i,
        ),
      );
    },
    [commit],
  );

  /** Ajoute la carte de réservation (bouton « Réserver une démo » toujours disponible). */
  const offerBooking = useCallback(() => {
    if (itemsRef.current.some((i) => i.kind === "booking")) return;
    commit([...itemsRef.current.map(stripReplies), { id: uid(), kind: "booking", status: "prompt" }]);
    track("assistant_booking_offered", { source: "button" });
  }, [commit]);

  const markBookingDone = useCallback(() => {
    if (itemsRef.current.some((i) => i.kind === "booking" && i.status === "done")) return;
    track("assistant_booking_done");
    const next: ThreadItem[] = itemsRef.current
      .map(stripReplies)
      .map((i) => (i.kind === "booking" ? { ...i, status: "done" as const } : i));
    commit([
      ...next,
      {
        id: uid(),
        kind: "message",
        role: "assistant",
        text: "Votre démonstration est réservée : Calendly vous envoie la confirmation par e-mail. Merci de votre confiance, à très bientôt.",
      },
    ]);
  }, [commit]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    streamingRef.current = false;
    setStreaming(false);
    firstNameRef.current = undefined;
    leadRef.current = null;
    commit([
      { id: uid(), kind: "message", role: "assistant", text: topic.opener, replies: topic.replies },
    ]);
  }, [commit, topic]);

  return {
    items,
    streaming,
    state,
    limitReached,
    userCount,
    lead: leadRef,
    send,
    submitContact,
    dismissContact,
    offerBooking,
    markBookingDone,
    reset,
  };
}
