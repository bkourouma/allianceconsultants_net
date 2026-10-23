"use client";

import {
  CONSENT_EVENT,
  OPEN_CONSENT_EVENT,
  clearGoogleAnalyticsCookies,
  readConsent,
  writeConsent,
  type ConsentChoice,
  type ConsentState,
} from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/ga";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// Repli en mémoire quand localStorage est inaccessible : le choix vaut pour la page en cours.
let memoryChoice: ConsentChoice | null = null;

/** « loading » côté serveur et pendant l'hydratation : ni bandeau ni balise. */
export type ConsentSnapshot = ConsentState | "loading";

export function getConsentSnapshot(): ConsentSnapshot {
  const stored = readConsent(storage());
  return stored !== "unset" ? stored : (memoryChoice ?? "unset");
}

export const getServerConsentSnapshot = (): ConsentSnapshot => "loading";

export function subscribeConsent(cb: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setConsentChoice(choice: ConsentChoice): void {
  // Le repli en mémoire ne sert que si le stockage est inutilisable (sinon il masquerait l'expiration).
  memoryChoice = writeConsent(storage(), choice) ? null : choice;
  // Drapeau officiel de désactivation de gtag.js pour une balise déjà chargée dans cette page.
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = choice === "refused";
  if (choice === "refused") clearGoogleAnalyticsCookies();
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Rouvre le bandeau (lien « Gérer mes cookies »). */
export function openConsentPanel(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
