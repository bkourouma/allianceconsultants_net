"use client";

type UmamiWindow = Window & {
  umami?: { track?: (event: string, data?: Record<string, string | number | boolean>) => void };
};

/**
 * Événement Umami (sans cookie). N'envoie jamais de donnée personnelle : seulement des
 * étapes de l'entonnoir (ouverture, formulaire, réservation) et le sujet de la page.
 * No-op si Umami n'est pas chargé (développement, bloqueur de pub).
 */
export function track(event: string, data?: Record<string, string | number | boolean>): void {
  try {
    (window as UmamiWindow).umami?.track?.(event, data);
  } catch {
    // Le suivi d'audience ne doit jamais gêner la conversation.
  }
}
