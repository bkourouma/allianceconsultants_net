"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import type { TopicResponse } from "@/lib/assistant/topics";
import { pageAccent } from "./accent";
import { track } from "./analytics";
import { markAssistantOpened, markNudged, useJourneyTracker } from "./journey";

// Le panneau (conversation, formulaire, Calendly) n'est téléchargé qu'à la première ouverture :
// avant cela, le widget ne pèse qu'un bouton et le suivi de parcours.
const AssistantPanel = dynamic(() => import("./AssistantPanel"), { ssr: false });

const NUDGE_VISIBLE_MS = 30_000;

// Repli si /api/assistant/topic est injoignable : le visiteur peut quand même discuter.
const FALLBACK_CONFIG: TopicResponse = {
  assistantName: "Assistant Alliance",
  calendlyUrl: null,
  contact: { phone: null, whatsapp: null },
  topic: {
    id: "default",
    kind: "default",
    label: "Alliance Consultants",
    nudge: "Une question sur nos solutions ? Je suis là pour vous orienter.",
    opener:
      "Bonjour, je suis l'assistant IA d'Alliance Consultants. Dites-moi ce que vous cherchez à améliorer dans votre organisation : je vous oriente vers la bonne solution.",
    replies: ["Gérer mes documents", "Gérer une clinique", "Gérer des biens immobiliers", "Former mon équipe"],
  },
};

async function fetchTopic(id: string): Promise<TopicResponse | null> {
  try {
    const res = await fetch(`/api/assistant/topic?id=${encodeURIComponent(id)}`);
    return res.ok ? ((await res.json()) as TopicResponse) : null;
  } catch {
    return null;
  }
}

/**
 * Assistant IA du site : un lanceur discret, une accroche proactive (jamais immédiate, une seule
 * fois par session, après un intérêt net pour une page) et le panneau de conversation.
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [panelConfig, setPanelConfig] = useState<TopicResponse | null>(null);
  const [nudge, setNudge] = useState<TopicResponse | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const panelConfigRef = useRef<TopicResponse | null>(null);
  panelConfigRef.current = panelConfig;

  const onNudge = useCallback((topicId: string) => {
    // Une seule accroche par session : on la marque avant même de récupérer son texte.
    markNudged();
    void fetchTopic(topicId).then((payload) => {
      if (!payload || panelConfigRef.current) return;
      setNudge(payload);
      track("assistant_nudge_shown", { topic: payload.topic.id });
    });
  }, []);
  const pageId = useJourneyTracker(onNudge);

  // L'accroche s'efface seule : elle propose, elle n'insiste pas.
  useEffect(() => {
    if (!nudge) return;
    const timer = window.setTimeout(() => setNudge(null), NUDGE_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [nudge]);

  const openAssistant = useCallback(
    async (source: "launcher" | "nudge") => {
      markAssistantOpened();
      track("assistant_opened", { source, page: pageId });
      if (!panelConfigRef.current) {
        const payload = source === "nudge" && nudge ? nudge : await fetchTopic(pageId);
        setPanelConfig(payload ?? FALLBACK_CONFIG);
      }
      setNudge(null);
      setOpen(true);
    },
    [nudge, pageId],
  );

  const close = useCallback(() => setOpen(false), []);

  // Rend le focus au lanceur à la fermeture (clavier et lecteurs d'écran).
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  const onNavigate = useCallback(() => {
    // Sur mobile le panneau couvre la page : on le replie pour montrer la destination.
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }, []);

  const accent = pageAccent(pageId);

  return (
    <div className="print:hidden" style={accent}>
      {panelConfig ? (
        <AssistantPanel config={panelConfig} open={open} onClose={close} onNavigate={onNavigate} />
      ) : null}

      {nudge && !open ? (
        <div
          role="status"
          className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-40 w-[min(19rem,calc(100vw-1.5rem))] animate-fade-up sm:right-4"
        >
          <div className="relative overflow-hidden rounded-lg bg-panel ring-1 ring-rule shadow-[0_10px_28px_-20px_rgba(7,18,43,0.55)]">
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[var(--accent)]" />
            <button
              type="button"
              onClick={() => void openAssistant("nudge")}
              className="block w-full py-3.5 pl-5 pr-12 text-left outline-offset-[-3px]"
            >
              <span className="block text-base leading-snug text-ink">{nudge.topic.nudge}</span>
              <span className="mt-1.5 block text-sm font-bold text-ink underline decoration-[var(--accent)] decoration-2 underline-offset-4">
                Discuter avec l&apos;assistant
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                track("assistant_nudge_dismissed");
                setNudge(null);
              }}
              aria-label="Fermer la suggestion"
              className="absolute right-0.5 top-0.5 grid size-11 place-items-center rounded-full text-ink-mute hover:text-ink"
            >
              <X aria-hidden className="size-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        hidden={open}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label="Une question ? Ouvrir l'assistant Alliance"
        onClick={() => void openAssistant("launcher")}
        onPointerEnter={() => {
          // Précharge le panneau : l'ouverture est alors instantanée.
          void import("./AssistantPanel");
        }}
        className="group/launcher fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-40 inline-flex h-14 items-center gap-3 rounded-full bg-ink pl-1.5 pr-1.5 text-base font-bold text-white shadow-[0_10px_28px_-14px_rgba(7,18,43,0.7)] transition-[background-color,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-night-2 active:translate-y-px sm:right-4 sm:pl-5"
      >
        <span className="hidden sm:inline">Une question ?</span>
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/launcher:-rotate-[8deg]"
        >
          <MessageCircle className="size-5" strokeWidth={2} />
        </span>
      </button>
    </div>
  );
}
