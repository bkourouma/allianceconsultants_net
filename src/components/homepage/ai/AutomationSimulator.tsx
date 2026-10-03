"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./AutomationSimulator.module.css";

interface AutomationSimulatorProps {
  /** Real capability bullets from content/homepage.mdx (aiSection.bullets). */
  bullets: string[];
}

type Mode = "before" | "after";

interface FlowNode {
  id: string;
  title: string;
  /** Index of the aiSection bullet that this step illustrates. */
  bulletIndex: number;
  what: string;
  after: { doing: string; done: string; note: string };
  before: { doing: string; done: string; note: string };
}

/* Generic, capability-level wording only (no figures, no durations). */
const NODES: FlowNode[] = [
  {
    id: "recu",
    title: "Courrier reçu",
    bulletIndex: 0,
    what: "Le document entre dans le circuit dès sa réception, sans transmission manuelle.",
    after: { doing: "Prise en charge", done: "Document lu", note: "Capté et lancé automatiquement." },
    before: { doing: "Posé sur un bureau", done: "Courrier enregistré", note: "Enregistré à la main, en attente d'un agent." },
  },
  {
    id: "extraction",
    title: "Extraction IA",
    bulletIndex: 2,
    what: "L'IA lit le document et en extrait les informations utiles, prêtes à être exploitées.",
    after: { doing: "Lecture en cours", done: "Champs extraits", note: "Les données sont lues par l'IA." },
    before: { doing: "Saisie en cours", done: "Champs ressaisis", note: "Les données sont retapées une à une." },
  },
  {
    id: "classement",
    title: "Classement GED",
    bulletIndex: 3,
    what: "Le contenu est classé et indexé automatiquement dans la gestion électronique des documents.",
    after: { doing: "Classement en cours", done: "Classé et indexé", note: "Classé et indexé sans intervention." },
    before: { doing: "Recherche du bon dossier", done: "Dossier classé", note: "Classé à la main, selon le jugement de chacun." },
  },
  {
    id: "validation",
    title: "Validation",
    bulletIndex: 1,
    what: "Le circuit de validation est digital : chacun voit où en est le dossier et valide au bon moment.",
    after: { doing: "En attente de visa", done: "Validé", note: "Circuit de validation digital." },
    before: { doing: "Circule de bureau en bureau", done: "Visa obtenu", note: "Le dossier voyage de main en main." },
  },
  {
    id: "archivage",
    title: "Archivage",
    bulletIndex: 5,
    what: "Le document validé est archivé électroniquement et reste facile à retrouver, y compris depuis vos outils existants.",
    after: { doing: "Archivage en cours", done: "Archivé", note: "Archivé et retrouvable." },
    before: { doing: "Mise en archive", done: "Rangé", note: "Rangé sur support physique." },
  },
];

const COUNT = NODES.length;
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

export function AutomationSimulator({ bullets }: AutomationSimulatorProps) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("after");
  /** Number of completed stations (0..COUNT). */
  const [cursor, setCursor] = useState(0);
  const [running, setRunning] = useState(false);
  /** Station the user explicitly inspected; otherwise the detail follows the token. */
  const [pinned, setPinned] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const autoplayed = useRef(false);

  const finished = cursor >= COUNT;
  const isRunning = running && !finished && !reduced;
  const tokenAt = Math.min(cursor, COUNT - 1);
  const focusIdx = pinned ?? tokenAt;
  const focusNode = NODES[focusIdx];
  const dwell = mode === "after" ? 1000 : 2300;
  const travel = Math.round(dwell * 0.55);
  const copy = mode === "after" ? "after" : "before";

  useEffect(() => {
    if (!isRunning) return;
    const t = window.setTimeout(() => setCursor((c) => c + 1), dwell);
    return () => window.clearTimeout(t);
  }, [isRunning, cursor, dwell]);

  // Play the circuit once, the first time the panel scrolls into view.
  // Reduced motion keeps it step by step; later control is the visitor's.
  useEffect(() => {
    if (reduced || autoplayed.current) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || autoplayed.current) return;
        autoplayed.current = true;
        setRunning(true);
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const reset = () => {
    setRunning(false);
    setCursor(0);
    setPinned(null);
  };
  const changeMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    reset();
  };
  const start = () => {
    autoplayed.current = true;
    if (finished) setCursor(0);
    setPinned(null);
    setRunning(true);
  };
  const step = () => {
    setPinned(null);
    setCursor((c) => Math.min(COUNT, c + 1));
  };

  const status = (i: number): "done" | "active" | "waiting" =>
    i < cursor ? "done" : i === cursor && isRunning ? "active" : "waiting";

  const liveMessage = finished
    ? "Simulation terminée."
    : cursor === 0 && !isRunning
      ? "Simulation prête."
      : `Étape ${tokenAt + 1} sur ${COUNT} : ${NODES[tokenAt].title}.`;

  const bulletText = bullets[focusNode.bulletIndex] ?? bullets[0];
  const nextTitle = NODES[Math.min(cursor, COUNT - 1)].title;

  return (
    <div ref={rootRef} className="rounded-lg bg-night-2 ring-1 ring-white/10">
      {/* Header: honest label + before/after switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <p className="text-sm font-semibold text-white/80">
          Aperçu illustratif <span className="font-normal text-white/60">· traitement d&apos;un courrier entrant</span>
        </p>
        <div role="group" aria-label="Mode du circuit" className="inline-flex rounded-full bg-night p-1 ring-1 ring-white/15">
          {(
            [
              ["before", "Avant : manuel"],
              ["after", "Après : automatisé"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => changeMode(m)}
              className={cn(
                "min-h-9 rounded-full px-3.5 text-sm font-semibold transition-colors duration-200",
                mode === m ? "bg-white text-ink" : "text-white/75 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Flow */}
      <div className="px-4 pb-6 pt-6 sm:px-6">
        <div
          className="relative grid h-[23rem] grid-rows-5 md:h-auto md:grid-cols-5 md:grid-rows-1"
          style={
            {
              "--p": tokenAt,
              "--travel": `${travel}ms`,
            } as CSSProperties
          }
        >
          <div aria-hidden className={cn(styles.track, mode === "before" && styles.manual)}>
            <div className={styles.fill} />
          </div>
          <span aria-hidden className={styles.token} />

          {NODES.map((n, i) => {
            const st = status(i);
            const c = n[copy];
            const label = st === "done" ? c.done : st === "active" ? c.doing : "En attente";
            const selected = focusIdx === i;
            return (
              <button
                key={n.id}
                type="button"
                aria-pressed={pinned === i}
                aria-label={`${n.title} : ${label}. Voir ce que fait cette étape.`}
                onClick={() => setPinned((p) => (p === i ? null : i))}
                className="group/node relative flex items-center gap-3 rounded-md px-0 text-left md:flex-col md:items-center md:gap-2 md:px-1 md:text-center"
              >
                <span className="grid size-11 shrink-0 place-items-center">
                  <span
                    className={cn(
                      "relative z-[1] grid size-[30px] place-items-center rounded-full border-[3px] transition-colors duration-300",
                      st === "done" && "border-[#7d9bff] bg-[#7d9bff] text-night",
                      st === "active" && "border-[#a78bfa] bg-[#6d3be0]",
                      st === "waiting" && "border-white/70 bg-night-2 group-hover/node:border-white",
                      selected && "outline outline-2 outline-offset-4 outline-white/70",
                    )}
                  >
                    {st === "done" && <Check className="size-4" strokeWidth={3} aria-hidden />}
                  </span>
                </span>
                <span className="block min-w-0">
                  <span className="block text-[0.9375rem] font-bold leading-tight text-white">{n.title}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[0.8125rem] leading-snug",
                      st === "waiting" ? "text-white/60" : "text-[#c4d2ff]",
                    )}
                  >
                    {label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls | station detail */}
      <div className="grid border-t border-white/10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-5 sm:px-6 lg:flex-col lg:items-start lg:justify-center">
        {reduced ? (
          <button
            type="button"
            onClick={step}
            disabled={finished}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-enamel disabled:opacity-50"
          >
            <SkipForward className="size-4" strokeWidth={2} aria-hidden />
            {finished ? "Circuit terminé" : `Étape suivante : ${nextTitle}`}
          </button>
        ) : isRunning ? (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-enamel"
          >
            <Pause className="size-4" strokeWidth={2} aria-hidden />
            Mettre en pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-enamel"
          >
            {finished ? <RotateCcw className="size-4" strokeWidth={2} aria-hidden /> : <Play className="size-4" strokeWidth={2} aria-hidden />}
            {finished ? "Rejouer" : cursor > 0 ? "Reprendre" : "Lancer la simulation"}
          </button>
        )}
        {cursor > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-semibold text-white/80 ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
            Réinitialiser
          </button>
        )}
        <p className="ml-auto max-w-[24ch] text-[0.8125rem] font-semibold leading-snug text-white/75 lg:ml-0 lg:mt-1">
          {finished
            ? mode === "after"
              ? "Du courrier reçu à l'archivage, le circuit s'enchaîne sans ressaisie."
              : "Un circuit lent et dépendant de chacun. Basculez sur « Après » pour comparer."
            : mode === "after"
              ? "Étapes enchaînées automatiquement"
              : "Chaque passage dépend d'une personne"}
        </p>
      </div>

      {/* Station detail */}
      <div className="border-t border-white/10 px-4 py-5 sm:px-6 lg:min-h-[10.5rem] lg:border-l lg:border-t-0" aria-live="polite">
        <h3 className="font-display text-lg font-bold text-white">{focusNode.title}</h3>
        <p className="mt-1.5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-white/80">{focusNode.what}</p>
        <dl className="mt-3 grid max-w-[60rem] gap-x-8 gap-y-2 text-[0.875rem] sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[#c4d2ff]">{mode === "after" ? "Avec l'automatisation" : "Aujourd'hui, à la main"}</dt>
            <dd className="mt-0.5 text-white/80">{focusNode[copy].note}</dd>
          </div>
          {bulletText && (
            <div>
              <dt className="font-semibold text-[#c4d2ff]">Capacité Alliance</dt>
              <dd className="mt-0.5 text-white/80">{bulletText}</dd>
            </div>
          )}
        </dl>
        <p className="sr-only" role="status">
          {liveMessage}
        </p>
      </div>
      </div>
    </div>
  );
}
