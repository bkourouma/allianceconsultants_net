"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { safeCallbackPath } from "@/lib/admin-callback";

/** Chemin du backoffice contenu dans l'URL renvoyée par NextAuth (son origine importe peu). */
function pathFromAuthUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  try {
    return safeCallbackPath(url, [new URL(url).origin]);
  } catch {
    return fallback;
  }
}

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  // Chemin du backoffice uniquement : on ignore toute autre cible (redirection ouverte,
  // ancien lien contenant l'adresse interne du serveur…).
  const callbackUrl = safeCallbackPath(params.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (!res || res.error) {
        setError("E-mail ou mot de passe invalide.");
        setSubmitting(false);
        return;
      }
      // On ne garde que le chemin : l'origine de `res.url` dépend des en-têtes du proxy.
      router.push(pathFromAuthUrl(res.url, callbackUrl));
      router.refresh();
    } catch {
      setError("Une erreur inattendue est survenue. Réessayez plus tard.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {submitting ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
