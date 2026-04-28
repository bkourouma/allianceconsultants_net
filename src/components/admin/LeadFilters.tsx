"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

const STATUSES = [
  { value: "", label: "Tous les statuts" },
  { value: "NEW", label: "Nouveau" },
  { value: "CONTACTED", label: "Contacté" },
  { value: "QUALIFIED", label: "Qualifié" },
  { value: "ARCHIVED", label: "Archivé" },
  { value: "SPAM", label: "Spam" },
];

const INTENTS = [
  { value: "", label: "Toutes les intentions" },
  { value: "DEMO", label: "Démo" },
  { value: "CONTACT", label: "Contact" },
  { value: "TRAINING", label: "Formation" },
  { value: "AUTOMATION", label: "Automatisation" },
  { value: "DIAGNOSTIC", label: "Diagnostic" },
];

export function LeadFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [intent, setIntent] = useState(params.get("intent") ?? "");
  const [search, setSearch] = useState(params.get("q") ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (intent) sp.set("intent", intent);
    if (search.trim()) sp.set("q", search.trim());
    const qs = sp.toString();
    router.push(`/admin/leads${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4"
    >
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Filtrer par statut"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Filtrer par intention"
      >
        {INTENTS.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Recherche (nom, email, organisation)"
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Recherche libre"
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
      >
        Filtrer
      </button>
    </form>
  );
}
