"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LeadStatusFormProps {
  leadId: string;
  initialStatus: "NEW" | "CONTACTED" | "QUALIFIED" | "ARCHIVED" | "SPAM";
  initialNotes: string;
}

const STATUSES: { value: LeadStatusFormProps["initialStatus"]; label: string }[] = [
  { value: "NEW", label: "Nouveau" },
  { value: "CONTACTED", label: "Contacté" },
  { value: "QUALIFIED", label: "Qualifié" },
  { value: "ARCHIVED", label: "Archivé" },
  { value: "SPAM", label: "Spam" },
];

export function LeadStatusForm({
  leadId,
  initialStatus,
  initialNotes,
}: LeadStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes.trim() || null }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Échec de la mise à jour.");
      } else {
        setSavedAt(new Date());
        router.refresh();
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-900">Qualification</h2>

      <div>
        <label htmlFor="lead-status" className="block text-sm font-medium text-slate-700">
          Statut
        </label>
        <select
          id="lead-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="mt-1 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="lead-notes" className="block text-sm font-medium text-slate-700">
          Notes internes
        </label>
        <textarea
          id="lead-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          maxLength={4000}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {savedAt ? (
        <p className="text-xs text-emerald-600">
          Enregistré à {savedAt.toLocaleTimeString("fr-FR")}.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
      >
        {submitting ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
