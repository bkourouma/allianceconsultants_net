"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { OPEN_CONSENT_EVENT } from "@/lib/consent";
import { getConsentSnapshot, getServerConsentSnapshot, setConsentChoice, subscribeConsent } from "./consentStore";

// Même poids visuel pour les deux choix : contour ink 2px, pastille pleine au survol.
const BTN =
  "inline-flex min-h-11 cursor-pointer flex-1 items-center justify-center rounded-[3px] bg-panel px-6 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink ring-2 ring-inset ring-ink transition-colors duration-200 hover:bg-ink hover:text-white sm:flex-none";

/**
 * Bandeau de consentement : fixé en bas (aucun décalage de mise en page), non bloquant.
 * « Accepter » et « Refuser » ont le même poids visuel.
 */
export function CookieConsent() {
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const [reopened, setReopened] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const open = () => {
      if (document.activeElement instanceof HTMLElement) opener.current = document.activeElement;
      setReopened(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const visible = consent === "unset" || reopened;

  const close = () => {
    setReopened(false);
    // Rend le focus au bouton « Gérer mes cookies » qui a rouvert le bandeau.
    const target = opener.current;
    opener.current = null;
    if (target?.isConnected) setTimeout(() => target.focus(), 0);
  };

  // Échap ferme le bandeau rouvert, sans changer le choix existant.
  useEffect(() => {
    if (!reopened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reopened]);

  // À la réouverture volontaire, le focus entre dans le bandeau ; au premier passage on ne le vole pas.
  useEffect(() => {
    if (reopened) ref.current?.focus();
  }, [reopened]);

  if (consent === "loading" || !visible) return null;

  const choose = (choice: "accepted" | "refused") => {
    setConsentChoice(choice);
    close();
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-[60] border-t-2 border-ink bg-panel pb-[env(safe-area-inset-bottom)] text-ink shadow-[0_-18px_30px_-18px_rgba(11,27,58,0.28)] outline-none print:hidden"
    >
      <div className="wrap flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="max-w-[68ch]">
          <p id="cookie-consent-title" className="font-display text-lg font-bold">
            Vos choix sur les cookies
          </p>
          <p id="cookie-consent-desc" className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">
            Avec votre accord, nous mesurons l&apos;audience du site avec Google Analytics (cookies de mesure). Sans
            votre accord, aucun cookie Google n&apos;est déposé. Vous pouvez changer d&apos;avis à tout moment.{" "}
            <Link
              href="/privacy#cookies-traceurs"
              className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4 hover:decoration-2"
            >
              Politique de confidentialité
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {reopened && consent !== "unset" && (
            <button type="button" className={BTN} onClick={close}>
              Fermer
            </button>
          )}
          <button type="button" className={BTN} onClick={() => choose("refused")}>
            Refuser
          </button>
          <button type="button" className={BTN} onClick={() => choose("accepted")}>
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
