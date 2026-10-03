"use client";

import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Chip, LiveNote, PreviewFrame } from "./PreviewFrame";

const MODULES = ["Docu-Archives", "Docu-GED", "Docu-Courriers", "Docu-Flow"] as const;
type Mod = (typeof MODULES)[number];

const DOCS: { title: string; module: Mod; meta: string }[] = [
  { title: "Contrat de maintenance serveur", module: "Docu-GED", meta: "PDF · version 3" },
  { title: "Procédure d'achats", module: "Docu-GED", meta: "Publié · version 2" },
  { title: "Contrat-cadre fournisseur", module: "Docu-GED", meta: "PDF · version 1" },
  { title: "Courrier entrant — demande d'agrément", module: "Docu-Courriers", meta: "Imputé à la direction" },
  { title: "Accusé de réception — courrier sortant", module: "Docu-Courriers", meta: "Reçu" },
  { title: "Dossier du personnel", module: "Docu-Archives", meta: "Durée d'utilité en cours" },
  { title: "Contrat de bail archivé", module: "Docu-Archives", meta: "Prêt physique : au service" },
  { title: "Circuit d'approbation des factures", module: "Docu-Flow", meta: "Étape 2 sur 4" },
  { title: "Validation de congés", module: "Docu-Flow", meta: "Étape 1 sur 3" },
];

/** Accent-insensitive, length-preserving fold so match indexes stay valid. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .split("")
    .map((c) => c.normalize("NFD")[0])
    .join("");

function Highlight({ text, query }: { text: string; query: string }) {
  const q = fold(query.trim());
  if (!q) return <>{text}</>;
  const i = fold(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-[var(--accent)] px-0.5 text-[var(--on-accent)]">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function DocuProPreview({ name }: { name: string }) {
  const inputId = useId();
  const [query, setQuery] = useState("contrat");
  const [mod, setMod] = useState<Mod | "Tous">("Tous");

  const results = useMemo(() => {
    const q = fold(query.trim());
    return DOCS.filter(
      (d) => (mod === "Tous" || d.module === mod) && (!q || fold(d.title).includes(q)),
    );
  }, [query, mod]);

  return (
    <PreviewFrame product={name} module="Recherche multicritère">
      <div className="flex h-full flex-col gap-3">
        <div>
          <label htmlFor={inputId} className="sr-only">
            Rechercher un document
          </label>
          <div className="flex min-h-11 items-center gap-2 rounded-md bg-enamel px-3 ring-1 ring-inset ring-rule focus-within:ring-2 focus-within:ring-ink sm:min-h-10">
            <Search aria-hidden className="size-4 shrink-0 text-ink-mute" strokeWidth={2} />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mot-clé, type de pièce…"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink placeholder:font-normal placeholder:text-ink-mute focus:outline-none"
            />
          </div>
        </div>
        <div role="group" aria-label="Filtrer par module" className="flex flex-wrap gap-1.5">
          {(["Tous", ...MODULES] as const).map((m) => (
            <Chip key={m} pressed={mod === m} onClick={() => setMod(m)}>
              {m}
            </Chip>
          ))}
        </div>
        <LiveNote>
          {results.length} résultat{results.length > 1 ? "s" : ""}
        </LiveNote>
        <ul className="-mt-1 min-h-0 flex-1 list-none divide-y divide-rule overflow-y-auto p-0">
          {results.map((d) => (
            <li key={d.title} className="flex items-baseline justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-snug">
                  <Highlight text={d.title} query={query} />
                </span>
                <span className="block text-[0.8125rem] text-ink-soft">{d.meta}</span>
              </span>
              <span className="shrink-0 text-[0.75rem] font-bold text-ink-mute">{d.module}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li className="py-6 text-sm text-ink-soft">
              Aucun document ne correspond. Essayez un autre mot-clé.
            </li>
          )}
        </ul>
      </div>
    </PreviewFrame>
  );
}
