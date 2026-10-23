"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { shouldLoadAnalytics } from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/ga";
import { getConsentSnapshot, getServerConsentSnapshot, subscribeConsent } from "./consentStore";

/**
 * Google Analytics 4, uniquement en production, sur le vrai site et après accord explicite du visiteur.
 * Aucun appel à Google tant que « Accepter » n'a pas été choisi. Placé dans le layout du site public uniquement.
 */
export function GoogleAnalytics() {
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  if (!shouldLoadAnalytics({ nodeEnv: process.env.NODE_ENV, hostname, consent })) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { cookie_expires: 34128000, allow_google_signals: false, allow_ad_personalization_signals: false });`}
      </Script>
    </>
  );
}
