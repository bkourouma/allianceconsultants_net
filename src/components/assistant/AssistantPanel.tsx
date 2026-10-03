"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CalendarCheck, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { MAX_MESSAGE_CHARS } from "@/lib/assistant/protocol";
import type { TopicResponse } from "@/lib/assistant/topics";
import { cn } from "@/lib/utils";
import { accentStyle } from "./accent";
import { track } from "./analytics";
import { BookingCard, BookingView } from "./Booking";
import { ContactCard } from "./ContactCard";
import { RichText } from "./RichText";
import styles from "./assistant.module.css";
import { useAssistantChat } from "./useAssistantChat";

interface AssistantPanelProps {
  config: TopicResponse;
  open: boolean;
  onClose: () => void;
  /** Appelé quand le visiteur suit un lien du chat (le widget replie le panneau sur mobile). */
  onNavigate: () => void;
}

export default function AssistantPanel({ config, open, onClose, onNavigate }: AssistantPanelProps) {
  const { assistantName, calendlyUrl, contact, topic } = config;
  const chat = useAssistantChat(config);
  const { items, streaming, state, limitReached, userCount } = chat;

  const [view, setView] = useState<"chat" | "booking">("chat");
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const seenCount = useRef(0);

  // Ouverture : focus sur le champ de saisie (sauf sur écran tactile, où le clavier masquerait la conversation).
  useEffect(() => {
    if (!open) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (view === "chat") (coarse ? panelRef.current : inputRef.current)?.focus({ preventScroll: true });
  }, [open, view]);

  // Défilement : colle au bas pendant la réponse ; amène en haut les nouvelles cartes (formulaire, réservation).
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduced ? "auto" : "smooth";
    const last = items[items.length - 1];
    const grew = items.length > seenCount.current;
    seenCount.current = items.length;
    if (grew && last && last.kind !== "message") {
      document.getElementById(`assistant-item-${last.id}`)?.scrollIntoView({ block: "start", behavior });
      return;
    }
    if (stickToBottom.current) log.scrollTo({ top: log.scrollHeight, behavior: streaming ? "auto" : behavior });
  }, [items, streaming, view]);

  const onLogScroll = () => {
    const log = logRef.current;
    if (!log) return;
    stickToBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  };

  const resizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  const submitDraft = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming || limitReached) return;
    stickToBottom.current = true;
    setDraft("");
    requestAnimationFrame(resizeInput);
    void chat.send(text);
  }, [chat, draft, limitReached, resizeInput, streaming]);

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submitDraft();
    }
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      if (view === "booking") setView("chat");
      else onClose();
    }
  };

  const openBooking = useCallback(() => {
    chat.offerBooking();
    if (calendlyUrl) {
      track("assistant_booking_opened");
      setView("booking");
    }
  }, [calendlyUrl, chat]);

  const onScheduled = useCallback(() => {
    chat.markBookingDone();
    setView("chat");
  }, [chat]);

  const lastAssistant = [...items].reverse().find((i) => i.kind === "message" && i.role === "assistant");
  // Les lecteurs d'écran n'entendent que la réponse terminée, pas chaque fragment du flux.
  const announcement = !streaming && lastAssistant && lastAssistant.kind === "message" ? lastAssistant.text : "";
  const lastMessageId = [...items].reverse().find((i) => i.kind === "message")?.id;
  const canShortcut = userCount >= 2 && !state.bookingShown && !state.bookingDone;

  return (
    <section
      ref={panelRef}
      id="assistant-panel"
      role="dialog"
      aria-label={`${assistantName}, assistant IA d'Alliance Consultants`}
      tabIndex={-1}
      hidden={!open}
      onKeyDown={onPanelKeyDown}
      style={accentStyle(topic.line)}
      className="fixed inset-x-2 bottom-2 z-[55] flex h-[min(44rem,calc(100dvh-1rem))] flex-col overflow-hidden rounded-lg bg-enamel text-ink shadow-[0_24px_48px_-28px_rgba(7,18,43,0.6)] outline-none ring-1 ring-rule animate-fade-up sm:inset-x-auto sm:bottom-4 sm:right-4 sm:h-[min(40rem,calc(100dvh-2rem))] sm:w-[24.5rem] print:hidden"
    >
      <header className="flex items-center gap-3 border-b-[3px] border-[var(--accent)] bg-night px-4 py-2.5 text-white">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)]"
        >
          <Sparkles className="size-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold leading-tight tracking-tight">{assistantName}</p>
          <p className="truncate text-xs text-[#c4d2ff]">Assistant IA</p>
        </div>
        {items.length > 1 ? (
          <button
            type="button"
            onClick={() => {
              chat.reset();
              setView("chat");
            }}
            aria-label="Recommencer la conversation"
            title="Recommencer la conversation"
            className="grid size-11 shrink-0 place-items-center rounded-full text-[#c4d2ff] transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw aria-hidden className="size-[1.125rem]" strokeWidth={2} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'assistant"
          className="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
        >
          <X aria-hidden className="size-5" strokeWidth={2} />
        </button>
      </header>

      {view === "booking" && calendlyUrl ? (
        <BookingView
          calendlyUrl={calendlyUrl}
          prefill={chat.lead.current}
          onBack={() => setView("chat")}
          onScheduled={onScheduled}
        />
      ) : (
        <>
          <div
            ref={logRef}
            onScroll={onLogScroll}
            role="log"
            aria-live="off"
            aria-busy={streaming}
            aria-label="Conversation"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3.5 py-4"
          >
            {items.map((item) => {
              if (item.kind === "contact_form") {
                return (
                  <div key={item.id} id={`assistant-item-${item.id}`} className="scroll-mt-2">
                    <ContactCard
                      id={item.id}
                      summary={item.summary}
                      status={item.status}
                      onSubmit={(values) => chat.submitContact(item.id, values)}
                      onDismiss={() => chat.dismissContact(item.id)}
                    />
                  </div>
                );
              }
              if (item.kind === "booking") {
                return (
                  <div key={item.id} id={`assistant-item-${item.id}`} className="scroll-mt-2">
                    <BookingCard status={item.status} calendlyUrl={calendlyUrl} contact={contact} onOpen={openBooking} />
                  </div>
                );
              }
              const mine = item.role === "user";
              return (
                <div key={item.id} className={cn("flex flex-col gap-2", mine ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "max-w-[90%] rounded-lg px-3.5 py-2.5 text-base leading-relaxed",
                      mine ? "bg-ink text-white" : "bg-panel text-ink ring-1 ring-rule",
                    )}
                  >
                    <span className="sr-only">{mine ? "Vous : " : `${assistantName} : `}</span>
                    {item.streaming && !item.text ? (
                      <span className={styles.dots} role="status" aria-label="L'assistant écrit">
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                      </span>
                    ) : mine ? (
                      <span className="whitespace-pre-wrap break-words">{item.text}</span>
                    ) : (
                      <RichText text={item.text} onNavigate={onNavigate} />
                    )}
                  </div>
                  {!mine && item.replies && item.id === lastMessageId && !streaming ? (
                    <div role="group" aria-label="Réponses suggérées" className="flex flex-wrap gap-2">
                      {item.replies.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => void chat.send(reply)}
                          className="min-h-11 rounded-full bg-panel px-4 py-1.5 text-left text-[0.9375rem] font-semibold text-ink ring-1 ring-ink-mute/50 transition-[box-shadow,background-color] duration-200 hover:ring-2 hover:ring-ink"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="sr-only" aria-live="polite">
            {announcement}
          </div>

          <div className="border-t border-rule bg-panel px-3 pb-2.5 pt-2">
            {canShortcut ? (
              <button
                type="button"
                onClick={openBooking}
                className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
              >
                <CalendarCheck aria-hidden className="size-4 text-[var(--accent)]" strokeWidth={2.25} />
                Pressé ? Réserver une démo
              </button>
            ) : null}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitDraft();
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Votre message
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_MESSAGE_CHARS}
                disabled={limitReached}
                placeholder={limitReached ? "Conversation terminée" : "Écrivez votre message…"}
                onChange={(event) => {
                  setDraft(event.target.value);
                  resizeInput();
                }}
                onKeyDown={onInputKeyDown}
                className="max-h-32 min-h-12 flex-1 resize-none rounded-lg border border-ink-mute/70 bg-panel px-3.5 py-3 text-base text-ink transition-colors placeholder:text-ink-mute focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-enamel"
              />
              <button
                type="submit"
                aria-label="Envoyer le message"
                disabled={!draft.trim() || streaming || limitReached}
                className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-white transition-[background-color,opacity] duration-200 hover:bg-night-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendHorizontal aria-hidden className="size-5" strokeWidth={2} />
              </button>
            </form>
            <p className="mt-2 text-xs leading-snug text-ink-mute">
              Assistant IA : ses réponses peuvent comporter des erreurs. Ne saisissez pas de données sensibles.{" "}
              <a
                href="/privacy#assistant-ia"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2 hover:text-ink"
              >
                Confidentialité
              </a>
            </p>
          </div>
        </>
      )}
    </section>
  );
}
