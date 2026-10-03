"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isQuietPage, pathToTopicId, type JourneyEntry } from "@/lib/assistant/protocol";

/**
 * Suivi discret du parcours du visiteur, pour que l'assistant puisse « remarquer » ce qui l'intéresse.
 *
 * - Tout reste dans le navigateur (sessionStorage, effacé à la fermeture de l'onglet) : rien n'est
 *   envoyé au serveur tant que le visiteur n'écrit pas à l'assistant.
 * - On ne compte que le temps de lecture réel : onglet visible ET activité récente (défilement,
 *   souris, clavier, toucher).
 */

const STORAGE_KEY = "acc-assistant-journey";
const MAX_VISITS = 12;
const IDLE_AFTER_MS = 20_000;
const TICK_MS = 1000;

// Seuils d'engagement : ce qui compte comme « une action » digne d'une accroche.
const ENGAGED_SECONDS = 25;
const ENGAGED_SECONDS_WITH_SCROLL = 12;
const ENGAGED_SCROLL = 0.55;
const REVISIT_SECONDS = 10;
const HOME_SECONDS = 40;

interface Visit {
  id: string;
  seconds: number;
  scroll: number;
  views: number;
}

interface Store {
  visits: Visit[];
  /** Une accroche a déjà été montrée dans cette session : jamais deux. */
  nudged: boolean;
  /** Le visiteur a déjà ouvert l'assistant : plus besoin de le solliciter. */
  opened: boolean;
}

function emptyStore(): Store {
  return { visits: [], nudged: false, opened: false };
}

function load(): Store {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    if (!Array.isArray(parsed.visits)) return emptyStore();
    return {
      visits: parsed.visits.slice(-MAX_VISITS),
      nudged: Boolean(parsed.nudged),
      opened: Boolean(parsed.opened),
    };
  } catch {
    return emptyStore();
  }
}

let store: Store | null = null;
/** Page en cours : évite de compter deux « vues » quand React rejoue l'effet (mode strict). */
let activePageId: string | null = null;

function current(): Store {
  store ??= load();
  return store;
}

function persist(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current()));
  } catch {
    // Stockage indisponible (navigation privée stricte) : le suivi fonctionne en mémoire.
  }
}

function isEngaged(v: Visit): boolean {
  if (v.id === "home") return v.seconds >= HOME_SECONDS && v.scroll >= ENGAGED_SCROLL;
  if (v.views >= 2 && v.seconds >= REVISIT_SECONDS) return true;
  return (
    v.seconds >= ENGAGED_SECONDS ||
    (v.seconds >= ENGAGED_SECONDS_WITH_SCROLL && v.scroll >= ENGAGED_SCROLL)
  );
}

/** Pages vues, de la plus ancienne à la plus récente, prêtes à être transmises à l'assistant. */
export function getJourneySnapshot(): JourneyEntry[] {
  return current()
    .visits.filter((v) => v.seconds >= 3)
    .slice(-8)
    .map((v) => ({
      id: v.id,
      seconds: Math.min(7200, Math.round(v.seconds)),
      scroll: Math.round(Math.min(1, Math.max(0, v.scroll)) * 100) / 100,
    }));
}

export function markAssistantOpened(): void {
  current().opened = true;
  persist();
}

export function markNudged(): void {
  current().nudged = true;
  persist();
}

/** Le sujet qui mérite une accroche maintenant, ou null. */
function nudgeCandidate(pageId: string): string | null {
  const s = current();
  if (s.nudged || s.opened || isQuietPage(pageId)) return null;
  const visit = s.visits.find((v) => v.id === pageId);
  return visit && isEngaged(visit) ? visit.id : null;
}

/**
 * Branche le suivi sur la page courante. `onNudge` est appelé une seule fois par session, quand
 * le visiteur a manifesté un intérêt net pour la page où il se trouve.
 */
export function useJourneyTracker(onNudge: (topicId: string) => void): string {
  const pathname = usePathname();
  const pageId = pathToTopicId(pathname);
  const onNudgeRef = useRef(onNudge);
  onNudgeRef.current = onNudge;

  useEffect(() => {
    const s = current();
    let visit = s.visits.find((v) => v.id === pageId);
    if (visit) {
      if (activePageId !== pageId) visit.views += 1;
    } else {
      visit = { id: pageId, seconds: 0, scroll: 0, views: 1 };
      s.visits.push(visit);
      if (s.visits.length > MAX_VISITS) s.visits.shift();
    }
    const thisVisit = visit;
    activePageId = pageId;
    persist();

    let lastActivity = Date.now();
    const markActive = () => {
      lastActivity = Date.now();
    };
    const onScroll = () => {
      markActive();
      const doc = document.documentElement;
      const total = doc.scrollHeight;
      if (total <= 0) return;
      const depth = (window.scrollY + window.innerHeight) / total;
      if (depth > thisVisit.scroll) thisVisit.scroll = Math.min(1, depth);
    };

    const events = ["pointermove", "keydown", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let sinceSave = 0;
    const timer = window.setInterval(() => {
      const reading =
        document.visibilityState === "visible" && Date.now() - lastActivity < IDLE_AFTER_MS;
      if (!reading) return;
      thisVisit.seconds += TICK_MS / 1000;
      sinceSave += 1;
      if (sinceSave >= 5) {
        sinceSave = 0;
        persist();
      }
      const candidate = nudgeCandidate(pageId);
      if (candidate) onNudgeRef.current(candidate);
    }, TICK_MS);

    const flush = () => persist();
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, markActive));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      persist();
    };
  }, [pageId]);

  return pageId;
}
