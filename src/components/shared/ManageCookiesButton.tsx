"use client";

import { openConsentPanel } from "./consentStore";

/** Rouvre le choix des cookies (pied de page). */
export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentPanel} className={`cursor-pointer ${className ?? ""}`.trim()} data-manage-cookies>
      Gérer mes cookies
    </button>
  );
}
