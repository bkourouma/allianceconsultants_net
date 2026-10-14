"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./AutomationSimulator.module.css";

interface AutomationSimulatorProps {
  /** Real capability bullets from content/homepage.mdx (aiSection.bullets). */
  bullets: string[];
}

type Mode = "before" | "after";

interface Station {
  id: string;
  title: string;
  /** Word pressed on the work order when it leaves the station. */
  stamp: string;
  /** Index of the aiSection bullet that this station illustrates. */
  bulletIndex: number;
  what: string;
  after: { doing: string; done: string; note: string };
  before: { doing: string; done: string; note: string };
}

/* Generic, capability-level wording only (no figures, no durations). */
const STATIONS: Station[] = [
  {
    id: "recu",
    title: "Courrier reçu",
    stamp: "Reçu",
    bulletIndex: 0,
    what: "Le document entre dans le circuit dès sa réception, sans transmission manuelle.",
    after: { doing: "Prise en charge", done: "Document lu", note: "Capté et lancé automatiquement." },
    before: { doing: "Posé sur un bureau", done: "Courrier enregistré", note: "Enregistré à la main, en attente d'un agent." },
  },
  {
    id: "extraction",
    title: "Extraction IA",
    stamp: "Extrait",
    bulletIndex: 2,
    what: "L'IA lit le document et en extrait les informations utiles, prêtes à être exploitées.",
    after: { doing: "Lecture en cours", done: "Champs extraits", note: "Les données sont lues par l'IA." },
    before: { doing: "Saisie en cours", done: "Champs ressaisis", note: "Les données sont retapées une à une." },
  },
  {
    id: "classement",
    title: "Classement GED",
    stamp: "Classé",
    bulletIndex: 3,
    what: "Le contenu est classé et indexé automatiquement dans la gestion électronique des documents.",
    after: { doing: "Classement en cours", done: "Classé et indexé", note: "Classé et indexé sans intervention." },
    before: { doing: "Recherche du bon dossier", done: "Dossier classé", note: "Classé à la main, selon le jugement de chacun." },
  },
  {
    id: "validation",
    title: "Validation",
    stamp: "Validé",
    bulletIndex: 1,
    what: "Le circuit de validation est digital : chacun voit où en est le dossier et valide au bon moment.",
    after: { doing: "En attente de visa", done: "Validé", note: "Circuit de validation digital." },
    before: { doing: "Circule de bureau en bureau", done: "Visa obtenu", note: "Le dossier voyage de main en main." },
  },
  {
    id: "archivage",
    title: "Archivage",
    stamp: "Archivé",
    bulletIndex: 5,
    what: "Le document validé est archivé électroniquement et reste facile à retrouver, y compris depuis vos outils existants.",
    after: { doing: "Archivage en cours", done: "Archivé", note: "Archivé et retrouvable." },
    before: { doing: "Mise en archive", done: "Rangé", note: "Rangé sur support physique." },
  },
];

/** Where each stamp lands on the work order (% of the coupon) + a slight tilt. */
const IMPRINTS: { left: number; top: number; rot: number }[] = [
  { left: 4, top: 46, rot: -5 },
  { left: 50, top: 49, rot: 4 },
  { left: 5, top: 64, rot: 3 },
  { left: 49, top: 67, rot: -5 },
  { left: 27, top: 81, rot: -3 },
];

const COUNT = STATIONS.length;
/**
 * The line is a small state machine over `stage`:
 *   even 2i   → the work order has reached station i (not yet stamped)
 *   odd 2i+1  → station i has stamped it
 */
const LAST_STAGE = COUNT * 2 - 1;

const TIMING: Record<Mode, { travel: number; arrive: number; dwell: number }> = {
  after: { travel: 700, arrive: 850, dwell: 650 },
  before: { travel: 1500, arrive: 1750, dwell: 1500 },
};

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

const BTN =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-[3px] px-5 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] transition-[background-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";
const BTN_MAIN = cn(BTN, "bg-white text-ink shadow-[0_1px_2px_rgb(15_42_90/0.14),0_8px_16px_-8px_rgb(15_42_90/0.3)] hover:bg-enamel");
const BTN_GHOST = cn(BTN, "px-4 text-white ring-2 ring-inset ring-white/60 hover:bg-white hover:text-ink");

export function AutomationSimulator({ bullets }: AutomationSimulatorProps) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("after");
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);
  /** Station the visitor explicitly inspected; otherwise the detail follows the order. */
  const [pinned, setPinned] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const autoplayed = useRef(false);

  const finished = stage >= LAST_STAGE;
  const isRunning = running && !finished && !reduced;
  const pos = Math.floor(stage / 2);
  const stamped = Math.ceil(stage / 2);
  const focusIdx = pinned ?? pos;
  const focus = STATIONS[focusIdx];
  const timing = TIMING[mode];

  useEffect(() => {
    if (!isRunning) return;
    const t = window.setTimeout(
      () => setStage((s) => Math.min(LAST_STAGE, s + 1)),
      stage % 2 === 0 ? timing.arrive : timing.dwell,
    );
    return () => window.clearTimeout(t);
  }, [isRunning, stage, timing.arrive, timing.dwell]);

  // Play the line once, the first time it scrolls into view. Under reduced
  // motion nothing moves by itself: the visitor steps with « Étape suivante ».
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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const replay = (nextMode: Mode = mode) => {
    autoplayed.current = true;
    setPinned(null);
    setStage(0);
    setRunning(!reduced);
    setMode(nextMode);
  };
  const changeMode = (m: Mode) => {
    if (m !== mode) replay(m);
  };
  const resume = () => {
    autoplayed.current = true;
    setPinned(null);
    setRunning(true);
  };
  const step = () => {
    setPinned(null);
    setStage((s) => Math.min(LAST_STAGE, s % 2 === 0 ? s + 1 : s + 2));
  };

  const status = (i: number): "done" | "active" | "waiting" =>
    i < stamped ? "done" : i === pos && isRunning ? "active" : "waiting";

  const liveMessage = finished
    ? "Circuit terminé : le bon de travail est archivé."
    : stage === 0 && !isRunning
      ? "Simulation prête."
      : `Étape ${pos + 1} sur ${COUNT} : ${STATIONS[pos].title}.`;

  const capability = bullets[focus.bulletIndex] ?? bullets[0];
  const nextTitle = STATIONS[Math.min(stage % 2 === 0 ? pos : pos + 1, COUNT - 1)].title;

  return (
    <div ref={rootRef} className="rounded-[4px] border-2 border-white/25 bg-night-2">
      {/* Header: honest label + before/after switch */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-2 border-dashed border-white/25 px-3 py-3 sm:px-5">
        <p className="m-0 font-mono text-[0.75rem] font-medium uppercase leading-snug tracking-[0.08em] text-[#c3d0ee]">
          Aperçu illustratif · bon de travail d&apos;un courrier entrant
        </p>
        <div role="group" aria-label="Mode du circuit" className="inline-flex gap-1.5">
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
                "min-h-11 rounded-[3px] px-3.5 font-display text-[1rem] font-bold uppercase tracking-[0.06em] ring-2 ring-inset transition-colors duration-200",
                mode === m
                  ? "bg-white text-ink ring-white"
                  : "text-white ring-white/45 hover:bg-white/10",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* The stamping line */}
      <div className="p-3 sm:p-5">
        <div
          className={styles.flow}
          style={
            {
              "--pos": pos,
              "--travel": `${timing.travel}ms`,
            } as CSSProperties
          }
        >
          <ol className={styles.stations} aria-label="Stations du circuit">
            {STATIONS.map((n, i) => {
              const st = status(i);
              const c = n[mode];
              const label = st === "done" ? c.done : st === "active" ? c.doing : "En attente";
              const selected = focusIdx === i;
              return (
                <li key={n.id} className={styles.station}>
                  <button
                    type="button"
                    aria-pressed={pinned === i}
                    aria-label={`${n.title} : ${label}. Épingler l'explication de cette étape.`}
                    onClick={() => setPinned((p) => (p === i ? null : i))}
                    className="group/st flex h-full min-h-11 w-full flex-col justify-center rounded-[3px] px-1 text-left lg:justify-start lg:px-2 lg:pt-1 lg:text-center"
                  >
                    <span
                      className={cn(
                        "block font-display text-[1.25rem] font-bold leading-tight transition-colors duration-200 sm:text-[1.375rem]",
                        st === "waiting" ? "text-white/80" : "text-white",
                        "group-hover/st:text-white",
                      )}
                    >
                      {n.title}
                    </span>
                    <span className="mt-1 flex items-start gap-1.5 text-[0.8125rem] leading-snug text-[#c3d0ee] lg:justify-center">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[0.3rem] size-2 shrink-0 rounded-[1px] transition-colors duration-300",
                          selected ? "bg-red" : st === "done" ? "bg-white" : "bg-white/35",
                        )}
                      />
                      <span className="min-w-0">{label}</span>
                    </span>
                    <span
                      aria-hidden
                      data-pressing={isRunning && stage === i * 2 + 1 ? "true" : "false"}
                      className={cn(styles.press, "lg:mt-auto")}
                    >
                      <span className={styles.knob} />
                      <span className={styles.stem} />
                      <span className={styles.plate} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div aria-hidden className={cn(styles.belt, mode === "before" && styles.beltManual)}>
            <div className={styles.slots}>
              {STATIONS.map((n, i) => {
                // Copy of the work order as it left this station; the live order
                // itself is drawn by the carrier while it sits here.
                const copy = i < stamped && i !== pos;
                return (
                  <span key={n.id} className={styles.slot}>
                    <span className={cn(styles.doc, copy && styles.docCopy)}>
                      <span className={styles.docHead} />
                      <span className={styles.bar} style={{ top: "28%", width: "62%" }} />
                      <span className={styles.bar} style={{ top: "35%", width: "38%" }} />
                      <span className={styles.orderTear} />
                      <span className={styles.docStamps}>
                        {copy &&
                          STATIONS.slice(0, i + 1).map((m, k) => (
                            <span
                              key={m.id}
                              className={cn("stamp", styles.mark)}
                              style={
                                {
                                  left: `${IMPRINTS[k].left}%`,
                                  top: `${IMPRINTS[k].top}%`,
                                  "--r": `${IMPRINTS[k].rot}deg`,
                                } as CSSProperties
                              }
                            >
                              {m.stamp}
                            </span>
                          ))}
                      </span>
                    </span>
                  </span>
                );
              })}
            </div>
            <div className={cn(styles.carrier, mode === "before" && styles.carrierSlow)}>
              <div className={styles.order}>
                <div className={styles.orderHead}>Bon de travail</div>
                <span className={styles.bar} style={{ top: "28%", width: "62%" }} />
                <span className={styles.bar} style={{ top: "35%", width: "38%" }} />
                <span className={styles.orderTear} />
                {STATIONS.slice(0, stamped).map((n, i) => (
                  <span
                    key={n.id}
                    className={cn("stamp", styles.mark)}
                    style={
                      {
                        left: `${IMPRINTS[i].left}%`,
                        top: `${IMPRINTS[i].top}%`,
                        "--r": `${IMPRINTS[i].rot}deg`,
                      } as CSSProperties
                    }
                  >
                    {n.stamp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls | pinned explanation */}
      <div className="grid gap-4 border-t-2 border-dashed border-white/25 p-3 sm:p-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
        <div className="flex flex-col items-start justify-center gap-3">
          <div className="flex flex-wrap gap-3">
            {reduced ? (
              <button type="button" onClick={step} disabled={finished} className={BTN_MAIN}>
                <SkipForward className="size-4" strokeWidth={2} aria-hidden />
                Étape suivante
              </button>
            ) : isRunning ? (
              <button type="button" onClick={() => setRunning(false)} className={BTN_MAIN}>
                <Pause className="size-4" strokeWidth={2} aria-hidden />
                Pause
              </button>
            ) : finished ? (
              <button type="button" onClick={() => replay()} className={BTN_MAIN}>
                <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
                Rejouer
              </button>
            ) : (
              <button type="button" onClick={resume} className={BTN_MAIN}>
                <Play className="size-4" strokeWidth={2} aria-hidden />
                {stage > 0 ? "Reprendre" : "Lancer"}
              </button>
            )}
            {stage > 0 && !finished && (
              <button type="button" onClick={() => replay()} className={BTN_GHOST}>
                <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
                Rejouer
              </button>
            )}
          </div>
          {reduced && !finished && (
            <p className="m-0 text-[0.8125rem] leading-snug text-[#c3d0ee]">Prochain poste : {nextTitle}</p>
          )}
          <p className="m-0 max-w-[26ch] text-[0.875rem] font-semibold leading-snug text-white/85">
            {finished
              ? mode === "after"
                ? "Du courrier reçu à l'archivage, le circuit s'enchaîne sans ressaisie."
                : "Un circuit lent et dépendant de chacun. Passez sur « Après » pour comparer."
              : mode === "after"
                ? "Étapes enchaînées automatiquement."
                : "Chaque passage dépend d'une personne."}
          </p>
        </div>

        <div className="coupon p-4 text-ink sm:p-5">
          <p className={cn(styles.field, "t-field m-0")}>
            {pinned === null ? "Étape en cours" : "Étape épinglée · cliquez à nouveau pour libérer"}
          </p>
          <h3 className="t-h3 m-0 mt-1">{focus.title}</h3>
          <p className="t-body m-0 mt-2 max-w-[64ch] text-[0.9375rem] leading-relaxed text-ink-soft">{focus.what}</p>
          <hr className="tear my-3" />
          <dl className="m-0 grid gap-x-8 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
            <div>
              <dt className={cn(styles.field, "t-field")}>{mode === "after" ? "Avec l'automatisation" : "Aujourd'hui, à la main"}</dt>
              <dd className="m-0 mt-0.5 leading-snug">{focus[mode].note}</dd>
            </div>
            {capability && (
              <div>
                <dt className={cn(styles.field, "t-field")}>Capacité Alliance</dt>
                <dd className="m-0 mt-0.5 leading-snug">{capability}</dd>
              </div>
            )}
          </dl>
        </div>
        <p className="sr-only" role="status">
          {liveMessage}
        </p>
      </div>
    </div>
  );
}
