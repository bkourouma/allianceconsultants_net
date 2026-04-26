"use client";

import { useEffect } from "react";

export function MatomoTracker() {
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  useEffect(() => {
    if (!matomoUrl || !matomoSiteId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _paq: unknown[][] = ((window as any)._paq = (window as any)._paq || []);
    _paq.push(["disableCookies"]);
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["anonymizeIp", 2]);
    _paq.push(["enableHeartBeatTimer"]);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    _paq.push(["setTrackerUrl", matomoUrl + "matomo.php"]);
    _paq.push(["setSiteId", matomoSiteId]);

    const d = document;
    const g = d.createElement("script");
    const s = d.getElementsByTagName("script")[0];
    g.async = true;
    g.src = matomoUrl + "matomo.js";
    if (s?.parentNode) {
      s.parentNode.insertBefore(g, s);
    }
  }, [matomoUrl, matomoSiteId]);

  return null;
}
