"use client";

import { useState, type FormEvent } from "react";

export function PasswordChangeForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    message: string;
  } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newPasswordConfirm: confirm,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: Record<string, string>;
        };
        if (body.errors) {
          const first = Object.values(body.errors)[0];
          setFeedback({ type: "error", message: first ?? "Validation échouée." });
        } else {
          setFeedback({
            type: "error",
            message: body.error ?? "Échec du changement de mot de passe.",
          });
        }
      } else {
        setFeedback({ type: "ok", message: "Mot de passe mis à jour." });
        setCurrent("");
        setNewPwd("");
        setConfirm("");
      }
    } catch {
      setFeedback({ type: "error", message: "Erreur réseau." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-900">Changer mon mot de passe</h2>
      <Field id="current-password" label="Mot de passe actuel">
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
          className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>
      <Field
        id="new-password"
        label="Nouveau mot de passe"
        hint="Au minimum 12 caractères, dont une minuscule, une majuscule et un chiffre."
      >
        <input
          id="new-password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPwd(e.target.value)}
          className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>
      <Field id="confirm-password" label="Confirmation">
        <input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </Field>

      {feedback ? (
        <p
          role="alert"
          className={
            feedback.type === "ok"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
      >
        {submitting ? "Enregistrement…" : "Mettre à jour"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
